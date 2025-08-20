import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    const coupons = await Coupon.find({ ownerUserId: userId });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}