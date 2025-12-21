import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    image: string;
    icon?: string;
    description?: string;
    productCount: number;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    icon: { type: String },
    description: { type: String },
    productCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<ICategory>('Category', CategorySchema);
