import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    // Find all coupons owned by this user
    const coupons = await Coupon.find({ ownerUserId: userId });
    
    let totalBenefits = 0;
    let referredUsers = [];
    
    coupons.forEach(coupon => {
      coupon.referredUsers.forEach(user => {
        totalBenefits += user.totalBenefit;
        referredUsers.push({
          userId: user.userId,
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