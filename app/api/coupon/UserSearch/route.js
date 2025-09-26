import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDB()
    
    const coupon = await Coupon.findOne({ ownerUserId: userId });
    if(coupon.code){
    if (!coupon) {
      return NextResponse.json({ success: false, message: "No coupon found" });
    }
    
    if (!coupon.discountPercentage || coupon.discountPercentage === 0) {
      return NextResponse.json({ success: true, discount: 0 });
    }
    
    const discount = coupon.discountPercentage;
    // Reset discount to 0 after retrieving it
    coupon.discountPercentage = 0;
    await coupon.save();
    
    return NextResponse.json({ success: true, discount });}
    const usedCoupon = await Coupon.findOne({ "referredUsers.userId": userId });

      if (!usedCoupon) {
        return NextResponse.json({ 
          success: false, 
          message: "No discount available. You have not used anyone's coupon." 
        });
      }

      // Increase the owner's discount by 2
     for (const c of usedCoupon) {
      c.discountPercentage = (c.discountPercentage || 5) + 2;
      await c.save();
    }

      return NextResponse.json({ 
        success: true, 
        discount:0,
        message: "You used another user's coupon. Their discount increased by 2." 
      });
    
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
