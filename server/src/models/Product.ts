import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    unit: string;
    isAvailable: boolean;
    salesCount: number;
    ratings: {
        user: mongoose.Types.ObjectId;
        name: string;
        rating: number;
        review: string;
        date: Date;
    }[];
    averageRating: number;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    salesCount: { type: Number, default: 0 },
    ratings: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: Number,
        review: String,
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);
