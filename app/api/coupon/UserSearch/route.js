import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function GET(request){
  try {
    const {userId}=getAuth(request)
    await connectDB()
    const getdiscount = await Coupon.findOne({ownerUserId:userId});
    if(!getdiscount){
        return NextResponse.json({ success: false, message: error.message});
    }
    if(!getdiscount.discount || getdiscount.discount===0){
        return 0;
    }
    const dis = getdiscount.discount;
    await Coupon.updateOne({_id:userId},
        {$set:{discount:0}}
    );
    return NextResponse.json({ success:true, dis})
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message})
  }
}