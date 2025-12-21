import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    shippingAddress: {
        label: string;
        full_address: string;
        city: string;
        pincode: string;
    };
    paymentMethod: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    paymentInfo?: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
    };
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        label: { type: String, required: true },
        full_address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    status: {
        type: String,
        enum: ['Placed', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    paymentInfo: {
        razorpay_order_id: String,
        razorpay_payment_id: String
    }
}, {
    timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
