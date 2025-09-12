import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },     // Clerk/Custom User ID
    username: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
