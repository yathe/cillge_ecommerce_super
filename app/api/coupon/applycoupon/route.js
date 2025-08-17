import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function GET(request){
  try {
    const {userId}=getAuth(request)
    const {code} = await request.json();
    await connectDB()
    
    const coupons = await Coupon.find({code})
    if(!coupons){
       return NextResponse.json({ success: false, message: error.message})
    }
    if(coupons.ownerUserId.equals(userId)){
       return NextResponse.json({ success: false, message: "you cannot use your own coupon"}) 
    }
    if(coupons.usedBy.includes(userId)){
       return NextResponse.json({ success: false, message: "you have used these coupon already"})
    }
    await Coupon.updateOne({_id:coupons._id},
        {$push:{usedBy:userId}}
    );
    const totaluser = coupons.usedBy.length+1;
    const ownerDiscount = totaluser*coupons.discount;
    await Coupon.updateOne({_id:coupons.ownerUserId},
        {$set:{discount:ownerDiscount}}
    );
    return NextResponse.json({ success:true})
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message})
  }
}