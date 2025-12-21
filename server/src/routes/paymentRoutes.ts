import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Create Order (Razorpay)
router.post('/create-order', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { amount } = req.body; // Amount in INR

        // In a real app, verify amount from DB items. For now, we trust frontend but verify in 'verify-payment' via DB comparison if needed.
        // Or better: Re-calculate here.

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Payment initiation failed' });
    }
});

// Verify Payment
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

        console.log('--- Payment Verification Debug ---');
        console.log('Received:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        console.log('Generated Body:', body);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        console.log('Expected Signature:', expectedSignature);
        console.log('Received Signature:', razorpay_signature);
        console.log('Secret Used (first 4 chars):', process.env.RAZORPAY_KEY_SECRET?.substring(0, 4));

        if (expectedSignature === razorpay_signature) {
            // Payment Success. Create DB Order.
            const userId = (req.user as any)._id;

            // Check First Delivery Free logic here? Or was it already applied in `totalAmount`?
            // `amount` paid is final.

            const newOrder = new Order({
                user: userId,
                items: orderDetails.items,
                totalAmount: orderDetails.totalAmount,
                shippingAddress: orderDetails.shippingAddress,
                paymentMethod: 'Prepaid (Razorpay)',
                status: 'Placed',
                paymentInfo: {
                    razorpay_order_id,
                    razorpay_payment_id
                }
            });

            await newOrder.save();

            // Decrement Stock & Increment Sales Count
            for (const item of orderDetails.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { salesCount: item.quantity, stock: -item.quantity }
                });
            }

            res.json({ message: 'Payment successful, order placed', orderId: newOrder._id });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

export default router;
