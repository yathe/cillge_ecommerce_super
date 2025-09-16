import connectDB from "@/config/db";
import Feedback from "@/models/FeedBack";
import { NextResponse } from "next/server";

export async function GET(request) {   // ✅ Correct: all caps
  try {
    await connectDB();
    const user = await Feedback.find();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
