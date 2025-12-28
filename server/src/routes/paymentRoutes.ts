import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { protect } from '../middleware/auth';
import { io } from '../index';
import { db, messaging } from '../config/firebase';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';

const router = express.Router();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpay: any;

if (key_id && key_secret) {
    razorpay = new Razorpay({
        key_id,
        key_secret
    });
} else {
    console.warn("WARNING: Razorpay keys are missing. Payment routes will fail.");
}

// Get Razorpay Key Config
router.get('/config', (req, res) => {
    res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID });
});

// Create order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, shippingAddress } = req.body;
        const options = {
            amount: amount * 100, // amount in paisa
            currency: 'INR',
            receipt: 'order_' + Date.now(),
        };

        if (!razorpay) {
            return res.status(503).json({ message: 'Payment gateway not configured' });
        }
        const order = await razorpay.orders.create(options);

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderDetails
        } = req.body;

        const { items: orderItems, shippingAddress, totalAmount, deliveryFee, discount } = orderDetails || {};

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest('hex');

        console.log("PAYMENT DEBUG:");
        console.log("Received Signature:", razorpay_signature);
        console.log("Generated Signature:", expectedSign);
        console.log("Sign Content:", sign);
        console.log("Key Secret Exists:", !!process.env.RAZORPAY_KEY_SECRET);

        if (razorpay_signature === expectedSign) {
            // Payment verified, create order

            // Prepare items by fetching from DB to ensure validity and data completeness
            const finalItems = [];
            for (const item of orderItems) {
                const productId = item.product.id || item.product;
                const product = await Product.findById(productId);

                if (product) {
                    finalItems.push({
                        product: product._id,
                        name: product.name,
                        image: product.image || '',
                        quantity: item.quantity,
                        price: product.price,
                        selectedColor: item.selectedColor // Include selected color
                    });
                }
            }

            const newOrder = await Order.create({
                user: req.user.uid,
                items: finalItems,
                totalAmount,
                deliveryFee: deliveryFee || 0,
                discount: discount || 0,
                shippingAddress,
                paymentMethod: 'Razorpay',
                paymentInfo: {
                    razorpay_order_id,
                    razorpay_payment_id
                }
            });

            // Update stock and handle Wishlist removal with error handling
            for (const item of orderItems) {
                try {
                    const productId = item.product.id || item.product;
                    const product = await Product.findById(productId);

                    if (product) {
                        await Product.update(productId, {
                            stock: Math.max(0, product.stock - item.quantity),
                            salesCount: (product.salesCount || 0) + item.quantity
                        });
                    }

                    // Remove from wishlist if present
                    const user = await User.findById(req.user.uid);
                    if (user && user.wishlist && user.wishlist.includes(productId)) {
                        const newWishlist = user.wishlist.filter(id => id !== productId);
                        await User.update(req.user.uid, { wishlist: newWishlist });
                    }
                } catch (err) {
                    console.error(`Error updating stock/wishlist for product ${item.product}:`, err);
                    // Continue with other items even if one fails
                }
            }

            // Emit event
            if (io) {
                // Ensure ID is string for socket
                const orderId = newOrder._id!.toString();

                io.to('admin').emit('newOrder', {
                    orderId: orderId,
                    totalAmount: newOrder.totalAmount,
                    status: newOrder.status
                });

                // Send Notification to User
                try {
                    await db.collection('users').doc(req.user.uid).collection('notifications').add({
                        title: 'Order Placed',
                        message: `Your order #${orderId.slice(-6).toUpperCase()} has been placed successfully.`,
                        read: false,
                        createdAt: new Date(),
                        type: 'order_placed',
                        orderId: orderId
                    });

                    // Send Push Notification
                    await notificationService.sendToUser(
                        req.user.uid,
                        'Order Placed Successfully',
                        `Your order #${orderId.slice(-6).toUpperCase()} has been placed. We will notify you once it's confirmed.`,
                        { type: 'order', orderId: orderId }
                    );

                    // Notify Admins
                    await notificationService.sendToAdmins(
                        'New Order Received',
                        `New order #${orderId.slice(-6).toUpperCase()} for ₹${newOrder.totalAmount}`,
                        { type: 'admin_order', orderId: orderId }
                    );

                } catch (e) {
                    console.error('Notification error', e);
                }
            }

            // Send email
            if (req.user.email) {
                sendOrderConfirmationEmail(req.user.email, newOrder);
            }

            res.json({ message: 'Payment verified and order created', orderId: newOrder._id });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// COD Order
router.post('/cod-order', protect, async (req, res) => {
    try {
        const { orderItems, shippingAddress, totalAmount, deliveryFee, discount } = req.body;

        const finalItems = [];
        for (const item of orderItems) {
            finalItems.push({
                product: item.product.id || item.product,
                name: item.name || item.product.name,
                image: item.image || item.product.image,
                quantity: item.quantity,
                price: item.price,
                selectedColor: item.selectedColor // Include selected color
            });
        }

        const newOrder = await Order.create({
            user: req.user.uid,
            items: finalItems,
            totalAmount,
            deliveryFee: deliveryFee || 0,
            discount: discount || 0,
            shippingAddress,
            paymentMethod: 'COD'
        });

        // Update stock with error handling
        for (const item of orderItems) {
            try {
                const productId = item.product.id || item.product;
                const product = await Product.findById(productId);
                if (product) {
                    await Product.update(productId, {
                        stock: Math.max(0, product.stock - item.quantity),
                        salesCount: (product.salesCount || 0) + item.quantity
                    });
                }
                // Remove from wishlist
                const user = await User.findById(req.user.uid);
                if (user && user.wishlist && user.wishlist.includes(productId)) {
                    const newWishlist = user.wishlist.filter(id => id !== productId);
                    await User.update(req.user.uid, { wishlist: newWishlist });
                }
            } catch (err) {
                console.error(`Error updating stock/wishlist for product ${item.product}:`, err);
                // Continue with other items
            }
        }

        res.json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (error) {
        console.error('Error placing COD order:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Refund Route - MUST be before export!
router.post('/refund/:orderId', protect, async (req, res) => {
    try {
        // Only admin can initiate refund
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized. Admin access required for refunds.' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.paymentMethod !== 'Razorpay' || !order.paymentInfo?.razorpay_payment_id) {
            return res.status(400).json({ message: 'Order is not eligible for Razorpay refund (Not paid via Razorpay)' });
        }

        if (!razorpay) {
            return res.status(503).json({ message: 'Payment gateway not configured' });
        }

        // Check if already refunded
        if (order.paymentStatus === 'refunded') {
            return res.status(400).json({ message: 'Order is already marked as refunded' });
        }

        const paymentId = order.paymentInfo!.razorpay_payment_id;
        const refundAmount = order.totalAmount * 100; // Refund full amount

        // Call Razorpay Refund API
        const refund = await razorpay.payments.refund(paymentId, {
            amount: refundAmount,
            speed: 'normal',
            receipt: `refund_${order._id}`
        });

        console.log("Razorpay Refund Response:", refund);

        // Update Order
        await Order.update(order._id!, {
            paymentStatus: 'refunded'
        });

        res.json({ message: 'Refund initiated successfully', refundId: refund.id });

    } catch (error: any) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            message: error.error?.description || 'Error processing refund',
            details: error
        });
    }
});

export default router;
