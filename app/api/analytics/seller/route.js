import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    // Get all coupons owned by this seller
    const coupons = await Coupon.find({ ownerUserId: userId })
    
    // Calculate analytics data
    let totalUsers = 0;
    let totalCouponApplications = 0;
    let totalProfit = 0;
    const profitByCoupon = [];
    const earningsPerUser = [];
    const userApplications = [];
    
    // Create a map to track user earnings
    const userEarningsMap = new Map();
    
    for (const coupon of coupons) {
      let couponProfit = 0;
      
      for (const referredUser of coupon.referredUsers) {
        totalUsers++;
        totalCouponApplications++;
        couponProfit += referredUser.totalBenefit;
        totalProfit += referredUser.totalBenefit;
        
        // Track earnings per user
        if (!userEarningsMap.has(referredUser.userId)) {
          // Try to get user name if available
          let userName = "Unknown User";
          try {
            const user = await User.findById(referredUser.userId);
            if (user) userName = user.name || user.email || userName;
          } catch (error) {
            console.log("Error fetching user:", error.message);
          }
          
          userEarningsMap.set(referredUser.userId, {
            name: userName,
            earnings: 0
          });
        }
        
        const userEarnings = userEarningsMap.get(referredUser.userId);
        userEarnings.earnings += referredUser.totalBenefit;
        userEarningsMap.set(referredUser.userId, userEarnings);
        
        // Add to user applications
        userApplications.push({
          userId: referredUser.userId,
          userName: userEarnings.name,
          couponCode: coupon.code,
          profit: referredUser.totalBenefit
        });
      }
      
      profitByCoupon.push({
        code: coupon.code,
        profit: couponProfit
      });
    }
    
    // Convert user earnings map to array
    userEarningsMap.forEach((value, key) => {
      earningsPerUser.push({
        userId: key,
        name: value.name,
        earnings: value.earnings
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCouponApplications,
        totalProfit,
        profitByCoupon,
        earningsPerUser,
        userApplications
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}