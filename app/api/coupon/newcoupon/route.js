import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import Order from "@/models/Order"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { code } = await request.json();
    
    await connectDB()

    // Check if user exists and get user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Check eligibility: 1 month old and 4+ purchases
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (user.createdAt > oneMonthAgo) {
      return NextResponse.json({ 
        success: false, 
        message: "You need to be a user for at least 1 month to generate a coupon" 
      });
    }

    if (user.totalPurchases < 4) {
      return NextResponse.json({ 
        success: false, 
        message: "You need at least 4 purchases to generate a coupon. You have ${user.totalPurchases} purchases." 
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" });
    }

    // Check if user already has a coupon
    const existingUserCoupon = await Coupon.findOne({ ownerUserId: userId });
    if (existingUserCoupon) {
      return NextResponse.json({ 
        success: false, 
        message: "You can only generate one coupon" 
      });
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code,
      ownerUserId: userId,
      referredUsers: [],
      discountPercentage: 5,
      ongoingBenefitPercentage: 2,
      isActive: true,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      coupon: newCoupon,
      message: "Coupon generated successfully!" 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
