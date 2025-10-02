import connectDB from "@/config/db"
import User from "@/models/User"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Check eligibility
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const isOneMonthOld = user.createdAt <= oneMonthAgo;
    const hasEnoughPurchases = user.totalPurchases >= 4;
    const isEligible = isOneMonthOld && hasEnoughPurchases;

    // Check if user already has a coupon
    const existingCoupon = await Coupon.findOne({ ownerUserId: userId });
    const hasCoupon = !!existingCoupon;

    return NextResponse.json({
      success: true,
      eligibility: {
        isEligible,
        isOneMonthOld,
        hasEnoughPurchases,
        userSince: user.createdAt,
        totalPurchases: user.totalPurchases,
        requiredPurchases: 4,
        hasCoupon,
        existingCouponCode: existingCoupon?.code
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}