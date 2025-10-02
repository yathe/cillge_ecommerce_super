import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(request){
  try{
    
     
   
    await connectDB();
    const { userId } = getAuth(request)
   
    let user = await User.findById(userId);
    
    if (!user) {
      console.log("User not found in DB, creating fallback...");

      // Get user info from Clerk (requires server SDK)
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then(res => res.json());

      user = await User.create({
        _id: userId,
  name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || "New User",
  email:
    clerkUser.email_addresses?.[0]?.email_address ||
    clerkUser.primary_email_address?.email_address ||
    `user_${userId}@cillage.com`,
  imageUrl: clerkUser.profile_image_url || "",
  cartItems: {},
  totalPurchases: 0,
  purchaseHistory: [],
      });

      console.log("✅ Fallback user created:", user);
    }
    return NextResponse.json({ success:true, user})
  }catch(error){
   return NextResponse.json({ success: false, message: error.message})
  }
}
