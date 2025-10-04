import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    // Find all coupons owned by this user
    const coupons = await Coupon.find({ ownerUserId: userId });
    console.log(userId);
    
    let totalBenefits = 0;
    let referredUsers = [];
    
    // Get all user IDs from referred users
    const allUserIds = [];
    coupons.forEach(coupon => {
      coupon.referredUsers.forEach(user => {
        allUserIds.push(user.userId);
      });
    });
    
    // Fetch user details for all referred users
    const users = await User.find({ _id: { $in: allUserIds } });
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), {
        name: user.name,
        email: user.email
      });
    });
    
    // Build referred users with names and emails
    coupons.forEach(coupon => {
      coupon.referredUsers.forEach(user => {
        const userDetails = userMap.get(user.userId.toString());
        totalBenefits += user.totalBenefit;
        referredUsers.push({
          userId: user.userId,
          name: userDetails?.name || "Unknown User",
          email: userDetails?.email || "No email",
          totalSpent: user.totalSpent,
          totalBenefit: user.totalBenefit,
          purchaseCount: user.purchaseCount
        });
      });
    });
    
    return NextResponse.json({ 
      success: true,
      totalBenefits,
      referredUsers,
      coupons: coupons.length
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}