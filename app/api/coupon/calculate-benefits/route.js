import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();
    await connectDB()
    
    // Find all coupons where this user is a referred user
    const coupons = await Coupon.find({
      "referredUsers.userId": userId
    });
    
    let benefitsApplied = [];
    
    for (const coupon of coupons) {
      const referredUser = coupon.referredUsers.find(user => user.userId === userId);
      if (referredUser) {
        // Calculate benefit for coupon owner (2% of purchase amount)
        const benefitAmount = amount * (coupon.ongoingBenefitPercentage / 100);
        
        // Update referred user's stats
        referredUser.totalSpent += amount;
        referredUser.totalBenefit += benefitAmount;
        
        benefitsApplied.push({
          couponId: coupon._id,
          ownerUserId: coupon.ownerUserId,
          benefitAmount: benefitAmount
        });
      }
    }
    
    await Promise.all(coupons.map(coupon => coupon.save()));
    
    return NextResponse.json({ 
      success: true,
      benefitsApplied,
      message: "Benefits calculated successfully"
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
