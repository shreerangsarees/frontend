import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'percentage' | 'flat';
    discountAmount: number;
    minOrderValue: number;
    expiryDate: Date;
    isActive: boolean;
}

const CouponSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountAmount: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
