import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Coupon from "@/models/GebnerateCoupon";
import connectDB from "@/config/db";

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid data'});
    }

    const amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return await acc + product.offerPrice * item.quantity;
    }, 0)

    const finalAmount = amount + Math.floor(amount * 0.02);

    // Calculate benefits for coupon owners
    await connectDB();
    const coupons = await Coupon.find({
      "referredUsers.userId": userId
    });
    
    for (const coupon of coupons) {
      const referredUser = coupon.referredUsers.find(user => user.userId === userId);
      if (referredUser) {
        // Calculate benefit for coupon owner (2% of purchase amount)
        const benefitAmount = amount * (coupon.ongoingBenefitPercentage / 100);
        
        // Update referred user's stats
        referredUser.totalSpent += amount;
        referredUser.totalBenefit += benefitAmount;
        referredUser.purchaseCount += 1;
        
        await coupon.save();
      }
    }

    await inngest.send({
      name: 'order/created',
      data: {
        userId,
        address,
        items,
        amount: finalAmount,
        date: Date.now()
      }
    });

    // clear user cart 
    const user = await User.findById(userId);
    user.cartItems = {}
    await user.save()
    
    return NextResponse.json({ success: true, message: 'Order Placed'})
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: error.message})
  }
}