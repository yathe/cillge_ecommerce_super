import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    ownerUserId: {
        type: String,
        required: true,
    },
    referredUsers: [{
        userId: String,
        totalSpent: { type: Number, default: 0 },
        totalBenefit: { type: Number, default: 0 },
        purchaseCount: { type: Number, default: 0 }
    }],
    discountPercentage: {
        type: Number,
        default: 5,
    },
    ongoingBenefitPercentage: {
        type: Number,
        default: 2,
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