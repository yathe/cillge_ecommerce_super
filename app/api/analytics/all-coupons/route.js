import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    // Get all coupons with their referred users
    const coupons = await Coupon.find({}).populate('referredUsers.userId')
    
    // Get all users to map user IDs to names
    const users = await User.find({})
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user._id.toString(), user.name || user.email)
    })
    
    // Process coupon data
    const couponData = coupons.map(coupon => {
      // Get coupon owner name
      const ownerName = userMap.get(coupon.ownerUserId) || "Unknown User"
      
      // Process referred users
      const referredUsers = coupon.referredUsers.map(refUser => {
        const userName = userMap.get(refUser.userId._id?.toString()) || 
                         userMap.get(refUser.userId) || 
                         "Unknown User"
        
        return {
          userId: refUser.userId._id?.toString() || refUser.userId,
          userName,
          totalSpent: refUser.totalSpent,
          totalBenefit: refUser.totalBenefit,
          purchaseCount: refUser.purchaseCount || 0
        }
      })
      
      return {
        code: coupon.code,
        ownerUserId: coupon.ownerUserId,
        ownerName,
        discountPercentage: coupon.discountPercentage,
        ongoingBenefitPercentage: coupon.ongoingBenefitPercentage,
        isActive: coupon.isActive,
        referredUsers,
        totalApplications: referredUsers.length,
        totalProfit: referredUsers.reduce((sum, user) => sum + user.totalBenefit, 0)
      }
    })
    
    return NextResponse.json({
      success: true,
      data: couponData
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}