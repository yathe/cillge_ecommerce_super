"use server";

import { redirect } from 'next/navigation';
import Razorpay from 'razorpay';
import connectDB from '@/config/db';
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();

  try {
    const body = await request.json();  
    const { transaction } = body;   
    
  
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY,
      key_secret: process.env.Razorpay_secret_key,
    });

 // Razorpay expects paise

    const options = {
      amount:Number(transaction.amount) * 100,
      currency: 'INR',
      receipt: `receipt_${transaction.buyerId}`,
      payment_capture: 1,
    };
   console.log("Transaction.amount received:", transaction.amount);
console.log("Final Razorpay options:", options);
    const order = await razorpay.orders.create(options);
   
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY,
      transactionMetadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      success_url: "http://localhost:3000/order-placed",
      cancel_url: "http://localhost:3000",
    });

  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
