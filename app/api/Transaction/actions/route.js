"use server";

import { redirect } from 'next/navigation';
import Razorpay from 'razorpay';
import connectDB from '@/config/db';
import { NextResponse } from "next/server";
export async function POST(request) {
  // Initialize Razorpay instance with your Razorpay keys
  await connectDB();
  const transaction = request.json();
  console.log("lop");
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY,
    key_secret: process.env.Razorpay_secret_key,
  });

  const amount = Number(transaction.amount) * 100; // Razorpay expects amount in paise

  // Create an order in Razorpay
  const options = {
    amount, // amount in paise
    currency: 'INR',
    receipt: `receipt_${transaction.buyerId}`, // Unique receipt ID
    payment_capture: 1, // 1 = auto capture, 0 = manual
  };

  try {
    const order = await razorpay.orders.create(options);

    // Send order info to client for Razorpay frontend SDK
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY, // Send key ID to client
      transactionMetadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      success_url: "http://localhost:3000/order-placed",
      cancel_url: `http://localhost:3000/`,
    };
  } catch (error) {
    
    return NextResponse.json({ success: false, message: error.message })
  }
}

