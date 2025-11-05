import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" })
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ success: false, message: "Coupon code is required" })
    }

    await connectDB()

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" })
    }

    // Check purchase condition
    if ((user.totalPurchases || 0) < 4) {
      return NextResponse.json({
        success: false,
        message: `You need at least 4 purchases to generate a coupon. You have ${user.totalPurchases || 0} purchases.`
      })
    }

    // Check coupon code uniqueness
    const existingCouponWithSameCode = await Coupon.findOne({ code })
    if (existingCouponWithSameCode) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" })
    }
const userCoupons = await Coupon.find({ ownerUserId: userId });

    // Check if user already has a coupon
   if (userCoupons.length > 0) {
  // Check agar koi coupon abhi tak unused hai
  const hasUnusedCoupon = userCoupons.find(
    (c) => !c.referredUsers || c.referredUsers.length === 0
  );
console.log(hasUnusedCoupon,"lop")
  if (hasUnusedCoupon) {
    return NextResponse.json({
      success: false,
      message:
        `You already have an unused coupon = " ${hasUnusedCoupon.code}"
        . Wait until all your coupons are used before generating a new one.
        `
    });
  }

  // ✅ Sirf frontend se aaye hue code wala coupon deactivate karo
  const targetCoupon = await Coupon.findOne({ ownerUserId: userId, code });

  if (!targetCoupon) {
    return NextResponse.json({
      success: false,
      message: "Coupon not found or does not belong to you."
    });
  }

  // 👇 Update sirf usi coupon ko inactive karna hai
  await Coupon.updateOne(
    { _id: targetCoupon._id },
    { $set: { isActive: false } }
  );
    }

    // 🔥 Yahan pe coupon create karna allowed hai
    const newCoupon = await Coupon.create({
      code,
      ownerUserId: userId,
      referredUsers: [],
      discountPercentage: 5,
      ongoingBenefitPercentage: 2,
      isActive: true,
      createdAt: new Date()
    })

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
      message: "Coupon generated successfully!"
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error?.message || "Something went wrong"
    })
  }
}
