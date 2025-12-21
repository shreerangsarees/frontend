import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    provider: string; // 'google', 'facebook', 'email'
    providerId?: string;
    role: 'customer' | 'admin' | 'delivery';
    addresses: {
        _id?: string;
        label: string;
        full_address: string;
        city: string;
        pincode: string;
        is_default: boolean;
    }[];
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    provider: { type: String, required: true, default: 'email' },
    providerId: { type: String },
    role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
    addresses: [{
        label: { type: String, required: true },
        full_address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        is_default: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
