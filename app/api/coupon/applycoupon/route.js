import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { code } = await request.json();
    await connectDB()
    
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid coupon code" })
    }
    if (coupon.ownerUserId === userId) {
      return NextResponse.json({ success: false, message: "You cannot use your own coupon" }) 
    }
    
    // Check if user has already used this coupon
    const existingUser = coupon.referredUsers.find(user => user.userId === userId);
    
    if (existingUser) {
      // User has used this coupon before, they can use it again
      return NextResponse.json({ 
        success: true,
        discount: coupon.discountPercentage,
        message: "Coupon applied successfully"
      })
    } else {
      // First time user of this coupon
      coupon.referredUsers.push({
        userId: userId,
        totalSpent: 0,
        totalBenefit: 0
      });
      await coupon.save();
      
      return NextResponse.json({ 
        success: true,
        discount: coupon.discountPercentage,
        message: "Coupon applied successfully"
      })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}