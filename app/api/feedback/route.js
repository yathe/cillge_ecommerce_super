import { NextResponse } from "next/server";
import connectDB from "@/config/db"
import Feedback from "@/models/FeedBack";

export async function POST(request) {
  try {
    await connectDB();
    const { userId, username, comment, rating } = await request.json();
    console.log(userId,username,comment,rating,"lop");
    if (!userId || !username || !comment || !rating) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }
   
    const feedbacks = await Feedback.create({ userId, username, comment, rating });
    
    return NextResponse.json({ success: true, feedbacks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}