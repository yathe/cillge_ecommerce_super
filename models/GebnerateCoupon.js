import mongoose, { Schema } from "mongoose";
const couponSchema = new mongoose.Schema({
    code:{
        type:String,required:true,unique:true,uppercase:true,
    },
    ownerUserId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        requied:true,
    },
    usedBy:[
        {type:Schema.Types.ObjectId,
            ref:"User",

        }
    ],
    discount:{
        type:Number,
        default:5,
    },
    isActive:{
        type:Boolean,
        default:true

    },

},{
    timestamps:true
});
const Coupon = mongoose.models.coupon || mongoose.model('coupon', couponSchema);
export default Coupon;