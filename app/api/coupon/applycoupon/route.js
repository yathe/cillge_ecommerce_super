import connectDB from "@/config/db";
import Coupon from "@/models/GebnerateCoupon";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendSMS, SMS_TEMPLATES } from "@/utils/smsService";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { code, cartAmount } = await request.json(); // Added cartAmount for discount calculation
    
    console.log('🎫 Coupon apply request:', { userId, code, cartAmount });
    
    await connectDB();

    // 1️⃣ Find current coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      console.log('❌ Coupon not found:', code);
      return NextResponse.json({ success: false, message: "Invalid coupon code" });
    }

    const ownerId = coupon.ownerUserId;
    console.log('👑 Coupon owner:', ownerId);

    // 2️⃣ Block owner using their own coupon
    if (ownerId === userId) {
      console.log('❌ Owner trying to use own coupon');
      return NextResponse.json({ success: false, message: "You cannot use your own coupon" });
    }

    // 3️⃣ Check if user already used this coupon
    const hasUsed = coupon.referredUsers.some(u => u.userId.toString() === userId);
    if (hasUsed) {
      console.log('❌ User already used this coupon');
      return NextResponse.json({
        success: false,
        message: "You have already used this coupon"
      });
    }

    // 4️⃣ Check if coupon already has another user (only one user per coupon)
    if (coupon.referredUsers.length >= 1) {
      console.log('❌ Coupon already used by another user');
      return NextResponse.json({
        success: false,
        message: "This coupon has already been used by another user"
      });
    }

    // 5️⃣ Add user to referred users and send SMS
    console.log('➕ Adding user to referred users');
    coupon.referredUsers.push({
      userId,
      totalSpent: 0,
      totalBenefit: 0,
      purchaseCount: 0,
      firstPurchaseDate: null,
      lastPurchaseDate: null
    });
    
    // Calculate discount amount
    const discountAmount = (cartAmount * coupon.discountPercentage) / 100;
    const discountedTotal = cartAmount - discountAmount;
    
    // 🔔 Send SMS notification to coupon owner
    let smsSent = false;
    try {
      const couponOwner = await User.findById(ownerId);
      const appliedUser = await User.findById(userId);
      
      console.log('📱 SMS Details - Owner:', {
        ownerId,
        ownerName: couponOwner?.name,
        ownerPhone: couponOwner?.phoneNumber,
        appliedUser: appliedUser?.name
      });
      
      if (couponOwner && couponOwner.phoneNumber) {
        const message = SMS_TEMPLATES.COUPON_APPLIED(
          couponOwner.name || 'Customer',
          appliedUser?.name || 'a new customer',
          code,
          discountAmount
        );
        
        console.log('📱 Sending coupon applied SMS via FAST2SMS...');
        smsSent = await sendSMS(couponOwner.phoneNumber, message);
        console.log('📱 Coupon applied SMS result:', smsSent);
      } else {
        console.warn('📱 No phone number found for coupon owner:', ownerId);
      }
    } catch (smsError) {
      console.error('📱 Failed to send coupon applied SMS:', smsError);
    }
    
    await coupon.save();
    
    console.log('✅ Coupon applied successfully, SMS sent:', smsSent);
    
    return NextResponse.json({
      success: true,
      discountPercentage: coupon.discountPercentage,
      discountAmount: discountAmount,
      discountedTotal: discountedTotal,
      message: "Coupon applied successfully! You got ${coupon.discountPercentage}% discount."
    });

  } catch (error) {
    console.error('❌ Coupon apply error:', error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
