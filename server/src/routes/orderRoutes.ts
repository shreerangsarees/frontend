import express from 'express';
import Order from '../models/Order';
import { protect, admin } from '../middleware/authMiddleware';
import { io } from '../index';

const router = express.Router();

import Product from '../models/Product';

// Create new order
router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

        // 1. Validate Stock & Calculate Total
        let calculatedTotal = 0;
        const finalItems: any[] = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Security: Use DB price, not frontend price
            calculatedTotal += product.price * item.quantity;

            finalItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price // Locking in the price at time of purchase
            });
        }

        // Recalculate full total including delivery
        // Store rules: Free delivery above 500. Delivery Fee 40.
        // Also check if first order.
        const orderCount = await Order.countDocuments({ user: (req.user as any)._id });
        const isFirstOrder = orderCount === 0;

        let deliveryFee = 40;
        if (isFirstOrder || calculatedTotal >= 500) {
            deliveryFee = 0;
        }

        // Apply discount if payment method is Razorpay? (Optional)
        // For now, we set totalAmount to exactly what it should be.
        // If a coupon code was passed in body (not yet supported in this route), we would deduct it.
        // Assuming no coupons for now in this route payload.

        const finalTotal = calculatedTotal + deliveryFee;

        const order = new Order({
            user: (req.user as any)._id,
            items: finalItems,
            totalAmount: finalTotal, // Server authority
            shippingAddress,
            paymentMethod,
            deliveryFee // Optional to store
        });

        const savedOrder = await order.save();

        // 2. Decrement Stock & Increment Sales
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, salesCount: item.quantity }
            });
        }

        // Emit new order event to admin room
        io.to('admin').emit('newOrder', {
            orderId: savedOrder._id,
            totalAmount: savedOrder.totalAmount,
            status: savedOrder.status
        });

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Get my orders
router.get('/my-orders', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const orders = await Order.find({ user: (req.user as any)._id })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Check order count for delivery eligibility
router.get('/count', async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ count: 0 });
        }
        const count = await Order.countDocuments({ user: (req.user as any)._id });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error checking order count' });
    }
});

// Get orders for delivery dashboard (Out for Delivery or Placed)
router.get('/delivery', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['Placed', 'Out for Delivery'] }
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const mappedOrders = orders.map((order: any) => ({
            ...order.toObject(),
            profiles: {
                full_name: order.user?.name || 'Guest',
                phone: order.shippingAddress?.phone
            },
            addresses: {
                full_address: order.shippingAddress?.address,
                city: order.shippingAddress?.city,
                pincode: order.shippingAddress?.pincode
            }
        }));

        res.json(mappedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery orders' });
    }
});

// Get all orders (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('items.product')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders' });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Update status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (order) {
            // Emit order status update to specific order room
            io.to(`order-${req.params.id}`).emit('orderStatusUpdated', {
                orderId: req.params.id,
                status: order.status
            });

            // Also emit to admin room
            io.to('admin').emit('orderStatusUpdated', {
                orderId: req.params.id,
                status: order.status
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

// User cancel order with automatic refund
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow cancellation if order is not already delivered or out for delivery
        if (['Delivered', 'Cancelled', 'Out for Delivery'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        let refundStatus = null;
        let refundMessage = '';

        // Check if this was a prepaid order and process refund
        if (order.paymentInfo?.razorpay_payment_id) {
            try {
                const Razorpay = require('razorpay');
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID!,
                    key_secret: process.env.RAZORPAY_KEY_SECRET!
                });

                // Initiate refund
                const refund = await razorpay.payments.refund(order.paymentInfo.razorpay_payment_id, {
                    amount: order.totalAmount * 100, // Amount in paise
                    speed: 'normal',
                    notes: {
                        order_id: order._id.toString(),
                        reason: 'Customer requested cancellation'
                    }
                });

                refundStatus = 'initiated';
                refundMessage = `Refund of ₹${order.totalAmount} initiated. Refund ID: ${refund.id}. It will be credited to your account within 5-7 business days.`;
                console.log('Refund initiated:', refund);
            } catch (refundError: any) {
                console.error('Refund failed:', refundError);
                refundStatus = 'failed';
                refundMessage = 'Automatic refund failed. Please contact support for manual refund processing.';
            }
        } else if (order.paymentMethod === 'cod') {
            refundMessage = 'No refund required for Cash on Delivery orders.';
        }

        order.status = 'Cancelled';
        await order.save();

        // Restore stock for cancelled items
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, salesCount: -item.quantity }
            });
        }

        // Emit cancellation event
        io.to(`order-${req.params.id}`).emit('orderStatusUpdated', {
            orderId: req.params.id,
            status: 'Cancelled'
        });

        io.to('admin').emit('orderStatusUpdated', {
            orderId: req.params.id,
            status: 'Cancelled'
        });

        res.json({
            message: 'Order cancelled successfully',
            order,
            refundStatus,
            refundMessage
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

export default router;
