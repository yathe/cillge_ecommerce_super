import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    const coupon = await Coupon.findOne({ ownerUserId: userId });
    if (!coupon) {
      return NextResponse.json({ success: false, message: "No coupon found" });
    }
    
    if (!coupon.discount || coupon.discount === 0) {
      return NextResponse.json({ success: true, discount: 0 });
    }
    
    const discount = coupon.discount;
    // Reset discount to 0 after retrieving it
    coupon.discount = 0;
    await coupon.save();
    
    return NextResponse.json({ success: true, discount });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}