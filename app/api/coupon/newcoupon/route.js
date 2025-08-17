import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function POST(request){
  try {
    const {userId}=getAuth(request)
    const {code} = await request.json();
    await connectDB()
    
    const insertcoupon = await Coupon.create({
        code,
        owneruserId:userId,
        usedBy:[],
        discount:5,
        isActive:true
    })
    return NextResponse.json({ success:true, insertcoupon})
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message})
  }
}