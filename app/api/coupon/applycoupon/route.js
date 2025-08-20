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
    if (coupon.usedBy.includes(userId)) {
      return NextResponse.json({ success: false, message: "You have already used this coupon" })
    }
    
    // Add user to usedBy array
    coupon.usedBy.push(userId);
    await coupon.save();
    
    return NextResponse.json({ 
      success: true,
      discount: coupon.discount,
      message: "Coupon applied successfully"
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}