"use client";
import { useAppContext } from "@/context/AppContext";
import React, { useState } from "react";
import toast from "react-hot-toast";

const FeedbackForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ username: "", comment: "", rating: 0 });
  const {user} = useAppContext();

  const handleSubmit = async(e) => {
    e.preventDefault();
    const full = user.id;

// Remove "user_" prefix
const id = full.replace(/^user_/, "");
     try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,           // from Clerk/Auth context
        username: form.username,
        comment: form.comment,
        rating: form.rating,
      }),
    });
    toast.success("feedback submit");
    onSubmit(form); 
}
catch(error){
      console.error("❌ Error submitting feedback:", err);
}
    // Pass feedback back to parent
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <input
        type="text"
        name="username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        placeholder="Your name"
        required
        className="border p-2 rounded w-full"
      />
      {/* Comment */}
      <textarea
        name="comment"
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        placeholder="Your feedback"
        required
        className="border p-2 rounded w-full"
      />
      {/* Rating */}
      <div className="flex space-x-2">
        {[1,2,3,4,5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setForm({ ...form, rating: star })}
            className={`text-2xl ${
              star <= form.rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-400 text-white rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};


export default FeedbackForm;
