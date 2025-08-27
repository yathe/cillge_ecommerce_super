import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { code } = await request.json();
    await connectDB()
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" });
    }
    //only one user create only one time coupon
    const checkcoupon = await Coupon.findOne({ownerUserId:userId});
    if (checkcoupon) {
      return NextResponse.json({ success: false, message: "You before generated coupon,then you not generate" });
    }
    const newCoupon = await Coupon.create({
      code,
      ownerUserId: userId, // This is now a string
       referredUsers: [],
      discountPercentage: 5,
      ongoingBenefitPercentage: 2,
      isActive: true
    });
    
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
