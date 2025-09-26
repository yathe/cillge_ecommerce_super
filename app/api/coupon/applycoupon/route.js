import connectDB from "@/config/db";
import Coupon from "@/models/GebnerateCoupon";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { code } = await request.json();
    await connectDB();

    // 1️⃣ Find current coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid coupon code" });
    }

    const ownerId = coupon.ownerUserId;

    // 2️⃣ Block owner using their own coupon
    if (ownerId === userId) {
      return NextResponse.json({ success: false, message: "You cannot use your own coupon" });
    }

    // 3️⃣ Find all coupons of this owner
    const ownerCoupons = await Coupon.find({ ownerUserId: ownerId }).sort({ createdAt: -1 });

    // ✅ Collect users who used previous coupons (exclude current coupon)
    const previousUsers = new Set;
    for (const c of ownerCoupons) {
      if (c.code !== code) {
        for (const ref of c.referredUsers) {
          previousUsers.add(ref.userId);
        }
      }
    }

    // 4️⃣ Block user if they used a previous coupon from the same owner
    if (previousUsers.has(userId)) {
      return NextResponse.json({
        success: false,
        message: "You already used a previous coupon from this seller. You cannot use their new coupon."
      });
    }

    // 5️⃣ Check if coupon already has another unique user
    const hasUsed = coupon.referredUsers.some(u => u.userId === userId);
    if (!hasUsed && coupon.referredUsers.length >= 1) {
      return NextResponse.json({
        success: false,
        message: "This coupon has already been used by another user"
      });
    }

    // 6️⃣ If first use, record the user
    if (!hasUsed) {
      coupon.referredUsers.push({
        userId,
        totalSpent: 0,
        totalBenefit: 0
      });
      
    }
   coupon.discountPercentage = (coupon.discountPercentage || 5) + 5; 
   await coupon.save();
    return NextResponse.json({
      success: true,
      discount: coupon.discountPercentage,
      message: "Coupon applied successfully"
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
