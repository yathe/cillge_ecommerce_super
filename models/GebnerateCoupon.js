import mongoose, { Schema } from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    ownerUserId: {
        type: String, // Changed from Schema.Types.ObjectId to String
        required: true,
    },
    usedBy: [
        {
            type: String, // Changed from Schema.Types.ObjectId to String
        }
    ],
    discount: {
        type: Number,
        default: 5,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;