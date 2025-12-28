import express from 'express';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { protect, admin, adminOrDelivery } from '../middleware/auth';
import { io } from '../index';
import { db, messaging } from '../config/firebase';
import { sendOrderConfirmationEmail, sendOrderStatusEmail, sendAdminCancellationEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Create new order
router.post('/', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { items, shippingAddress, paymentMethod } = req.body;

        // Debug: Log the incoming items to see selectedColor
        console.log('Order Creation - Incoming items:', JSON.stringify(items, null, 2));

        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

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

            calculatedTotal += product.price * item.quantity;

            // Store snapshot of product details
            finalItems.push({
                product: product._id,
                name: product.name || 'Unknown Product',
                image: product.image || '',
                quantity: item.quantity,
                price: product.price,
                selectedColor: item.selectedColor // Add this line
            });
        }

        // Debug: Log finalItems after processing
        console.log('Order Creation - Final items being saved:', JSON.stringify(finalItems, null, 2));

        // Delivery Fee Logic - For validation only
        const orderCount = await Order.countByUser(req.user.uid);
        const isFirstOrder = orderCount === 0;
        let expectedDeliveryFee = 40;
        if (isFirstOrder || calculatedTotal >= 500) {
            expectedDeliveryFee = 0;
        }

        // IMPORTANT: Use the totalAmount sent from frontend (which includes discount and delivery fee)
        // Frontend has already calculated: subtotal - discount + delivery fee
        const finalTotal = req.body.totalAmount;

        // Store the delivery fee from frontend or calculated
        const deliveryFee = req.body.deliveryFee !== undefined ? req.body.deliveryFee : expectedDeliveryFee;

        // Store discount if provided
        const discount = req.body.discount || 0;

        // Create Order
        const order = await Order.create({
            user: req.user.uid,
            items: finalItems,
            totalAmount: finalTotal,
            shippingAddress,
            paymentMethod,
            deliveryFee,
            discount,
            ...(req.body.paymentInfo && { paymentInfo: req.body.paymentInfo })
        });

        // 2. Decrement Stock
        for (const item of items) {
            // Transaction ideally, but simple update for now
            // We need to fetch current again to be safe in high concurrency, 
            // but for this MVP direct decrement via increment(-qty) is better if Firestore supports it.
            // Firestore supports FieldValue.increment(-qt). Let's do it manually via reading for now 
            // as our Product Service wraps it.
            const p = await Product.findById(item.product);
            if (p) {
                await Product.update(item.product, {
                    stock: p.stock - item.quantity,
                    salesCount: (p.salesCount || 0) + item.quantity
                });
            }
        }

        // Emit new order event
        if (io) {
            io.to('admin').emit('newOrder', {
                orderId: order._id,
                totalAmount: order.totalAmount,
                status: order.status
            });

            // Send Notification to User
            // Notification logic will be added here or via a Trigger
            try {
                await db.collection('users').doc(req.user.uid).collection('notifications').add({
                    title: 'Order Placed',
                    message: `Your order #${order._id} has been placed successfully.`,
                    read: false,
                    createdAt: new Date(),
                    type: 'order_placed',
                    orderId: order._id
                });

                // Send Push Notification
                await notificationService.sendToUser(
                    req.user.uid,
                    'Order Placed Successfully',
                    `Your order #${order._id!.slice(-6).toUpperCase()} has been placed. We will notify you once it's confirmed.`,
                    { type: 'order', orderId: order._id! }
                );

                // Notify Admins
                await notificationService.sendToAdmins(
                    'New Order Received',
                    `New order #${order._id!.slice(-6).toUpperCase()} for ₹${order.totalAmount}`,
                    { type: 'admin_order', orderId: order._id! }
                );

            } catch (e) { console.error('Notification error', e) }
        }

        // Send order confirmation email
        if (req.user.email) {
            sendOrderConfirmationEmail(req.user.email, order);
        }

        res.status(201).json(order);
    } catch (error: any) {
        console.error('Error creating order - Stack:', error.stack);
        console.error('Error creating order - Message:', error.message);
        console.error('Error creating order - Body:', req.body);
        res.status(500).json({ message: `Error creating order: ${error.message}` });
    }
});

// Get my orders
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.findByUser(req.user.uid);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get orders for delivery dashboard
router.get('/delivery', protect, adminOrDelivery, async (req, res) => {
    try {
        const orders: any[] = await Order.findByStatus(['Pending', 'Processing', 'Shipped', 'Out for Delivery']);

        // We might need to manually fetch user details if not stored in order
        // But for performance, we should probably have stored user Name/Email in Order snapshot too.
        // For now, let's fetch user for each order (N+1 but manageable for dashboard)
        const mappedOrders = await Promise.all(orders.map(async (order) => {
            const user = await User.findById(order.user);
            return {
                id: order._id,
                status: order.status,
                total_amount: order.totalAmount,
                payment_method: order.paymentMethod,
                created_at: order.createdAt,
                items: order.items,
                profiles: {
                    full_name: user?.displayName || 'Guest',
                    email: user?.email,
                    phone: order.shippingAddress?.phone
                },
                addresses: order.shippingAddress
            };
        }));

        res.json(mappedOrders);
    } catch (error) {
        console.error('Error fetching delivery orders:', error);
        res.status(500).json({ message: 'Error fetching delivery orders' });
    }
});

// Get all orders (Admin) with populated user details
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders: any[] = await Order.findAll();

        // Populate user details manualy
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const user = await User.findById(order.user);
            return {
                ...order,
                user: user ? {
                    name: user.displayName,
                    email: user.email,
                    phone: (user as any).phoneNumber,
                    avatar: user.photoURL
                } : { name: 'Unknown', email: 'N/A' }
            };
        }));

        res.json(populatedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all orders' });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Update status
router.put('/:id/status', protect, adminOrDelivery, async (req, res) => {
    try {
        const { status } = req.body;

        // Fetch current order to check payment method
        const currentOrder = await Order.findById(req.params.id);
        if (!currentOrder) return res.status(404).json({ message: 'Order not found' });

        const updateData: any = { status };

        // If Delivered and COD, mark as Paid
        if (status === 'Delivered') {
            updateData.paymentStatus = 'paid';
            if (currentOrder.paymentMethod && currentOrder.paymentMethod.toLowerCase() === 'cod') {
                updateData.paymentStatus = 'paid'; // COD paid on delivery
            }
        }

        const order = await Order.update(req.params.id, updateData);

        // Notify User via Socket
        if (io) {
            io.emit('orderStatusUpdated', { orderId: req.params.id, status });
        }

        // Notify User via Push Notification
        if (order && order.user) {
            await notificationService.sendToUser(
                order.user,
                `Order ${status}`,
                `Your order #${order._id ? order._id.slice(-6).toUpperCase() : 'N/A'} is now ${status}.`,
                { type: 'order_status', orderId: order._id || '', status }
            );
        }

        // Notify User via Firestore
        try {
            if (order) {
                const eventData = {
                    orderId: req.params.id,
                    status: order.status,
                    updatedAt: new Date()
                };

                await db.collection('users').doc(order.user).collection('notifications').add({
                    title: `Order ${status}`,
                    message: `Your order #${order._id} is now ${status}.`,
                    read: false,
                    createdAt: new Date(),
                    type: 'order_status',
                    ...eventData
                });
            }
        } catch (e) {
            console.error('Error sending notification', e);
        }

        // Send Email
        const user = await User.findById(order.user);
        if (user && user.email) {
            sendOrderStatusEmail(user.email, order, status);
        }

        res.json(order);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Cancel Order
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Check ownership or admin
        if (order.user !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Can only cancel Pending or Processing orders
        if (!['Pending', 'Processing'].includes(order.status)) {
            return res.status(400).json({
                message: `Cannot cancel order with status: ${order.status}. Only Pending or Processing orders can be cancelled.`
            });
        }

        const { reason } = req.body;

        await Order.update(req.params.id, {
            status: 'Cancelled',
            cancelledAt: new Date(),
            cancellationReason: reason,
            updatedAt: new Date()
        });

        // Restore stock
        for (const item of order.items) {
            const p = await Product.findById(item.product);
            if (p) {
                await Product.update(item.product, {
                    stock: p.stock + item.quantity,
                    salesCount: Math.max(0, (p.salesCount || 0) - item.quantity)
                });
            }
        }

        // Emit event
        if (io) {
            io.to(`order-${req.params.id}`).emit('orderStatusUpdated', {
                orderId: req.params.id,
                status: 'Cancelled'
            });
            io.to('admin').emit('orderCancelled', { orderId: req.params.id });
        }

        // Add notification
        await db.collection('users').doc(order.user).collection('notifications').add({
            title: 'Order Cancelled',
            message: `Your order #${req.params.id.slice(-6).toUpperCase()} has been cancelled.`,
            read: false,
            createdAt: new Date(),
            type: 'order'
        });

        // Send Push Notification
        await notificationService.sendToUser(
            order.user,
            'Order Cancelled',
            `Your order #${req.params.id.slice(-6).toUpperCase()} has been cancelled.`,
            { type: 'order_cancelled', orderId: req.params.id }
        );

        // Send Email to Admin
        sendAdminCancellationEmail(order, reason || 'Cancelled by user');

        res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

// Request Return
router.put('/:id/return', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user !== req.user.uid && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Can only request return for Delivered orders
        if (order.status !== 'Delivered') {
            return res.status(400).json({
                message: `Cannot request return for order with status: ${order.status}. Only Delivered orders can be returned.`
            });
        }

        // Check if within return window (7 days)
        const deliveredDate = new Date(order.updatedAt || order.createdAt || Date.now());
        const currentDate = new Date();
        const diffDays = Math.ceil((currentDate.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return res.status(400).json({
                message: 'Return window has expired. Returns are only accepted within 7 days of delivery.'
            });
        }

        const { reason, items, requestType } = req.body; // requestType: 'return' | 'replace'
        const isReplacement = requestType === 'replace';
        const newStatus = isReplacement ? 'Replacement Requested' : 'Return Requested';

        await Order.update(req.params.id, {
            status: newStatus,
            returnReason: reason || 'Product issue', // We use same field for both
            returnRequestedAt: new Date(),
            returnItems: items || order.items.map((i: any) => i.product),
            requestType: requestType || 'return'
        });

        // Emit event
        if (io) {
            io.to('admin').emit('returnRequested', { orderId: req.params.id, type: requestType });
        }

        // Add notification
        const title = isReplacement ? 'Replacement Requested' : 'Return Requested';
        const message = `Your ${isReplacement ? 'replacement' : 'return'} request for order #${req.params.id.slice(-6).toUpperCase()} has been submitted. We will contact you shortly.`;

        await db.collection('users').doc(order.user).collection('notifications').add({
            title,
            message,
            read: false,
            createdAt: new Date(),
            type: 'order'
        });

        // Send email
        const user = await User.findById(order.user);
        if (user?.email) {
            sendOrderStatusEmail(user.email, { ...order, id: req.params.id }, newStatus);
        }

        res.json({ message: `${isReplacement ? 'Replacement' : 'Return'} request submitted successfully. Our team will contact you within 24-48 hours.` });

    } catch (error) {
        console.error('Error requesting return/replacement:', error);
        res.status(500).json({ message: 'Error requesting return/replacement' });
    }
});

// Approve/Process Return - Admin only
router.put('/:id/return/process', protect, admin, async (req, res) => {
    try {
        const { action, refundAmount } = req.body; // action: 'approve' | 'reject'
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!['Return Requested', 'Replacement Requested'].includes(order.status)) {
            return res.status(400).json({ message: 'Order is not in Return or Replacement Requested status' });
        }

        if (action === 'approve') {
            const isReplacement = order.status === 'Replacement Requested';

            if (isReplacement) {
                // For Replacement: Status becomes 'Processing' (to send new item)
                // We might want to create a clone order or just reset this one. 
                // For MVP, resetting this order to Processing is simplest.
                await Order.update(req.params.id, {
                    status: 'Processing',
                    returnProcessedAt: new Date(),
                    // Maybe add a flag or note that this is a replacement processing
                });

                // For replacement, we typically assume stock is handled or we need to re-deduct? 
                // If we assume a swap, stock might not change net (1 in, 1 out).
                // But usually we receive return first.
                // Let's assume we are sending a new one now.
            } else {
                // For Return: Status 'Returned'
                await Order.update(req.params.id, {
                    status: 'Returned',
                    refundAmount: refundAmount || order.totalAmount,
                    returnProcessedAt: new Date()
                });

                // Restore stock only for Returns (for Replacement, if we send new one, we might consume stock? 
                // Or if we get old one back, it cancels out? Let's leave stock logic simple: Restore on Return.)
                for (const item of order.items) {
                    const p = await Product.findById(item.product);
                    if (p) {
                        await Product.update(item.product, {
                            stock: p.stock + item.quantity
                        });
                    }
                }
            }

            // Notify user
            const title = isReplacement ? 'Replacement Approved' : 'Return Approved';
            const message = isReplacement
                ? `Your replacement request for order #${req.params.id.slice(-6).toUpperCase()} has been approved. We are processing the new shipment.`
                : `Your return for order #${req.params.id.slice(-6).toUpperCase()} has been approved. Refund of ₹${refundAmount || order.totalAmount} will be processed within 5-7 business days.`;

            await db.collection('users').doc(order.user).collection('notifications').add({
                title,
                message,
                read: false,
                createdAt: new Date(),
                type: 'order'
            });

            // Send Push Notification
            await notificationService.sendToUser(
                order.user,
                title,
                message,
                { type: 'return_status', orderId: req.params.id, status: 'approved' }
            );

            res.json({ message: isReplacement ? 'Replacement approved, order set to Processing' : 'Return approved and refund initiated' });
        } else {
            // Reject
            await Order.update(req.params.id, {
                status: 'Delivered', // Revert to delivered
                returnRejectedAt: new Date(),
                returnRejectionReason: req.body.rejectionReason || 'Does not meet return policy'
            });

            await db.collection('users').doc(order.user).collection('notifications').add({
                title: 'Return/Replacement Rejected',
                message: `Your request for order #${req.params.id.slice(-6).toUpperCase()} has been rejected. Reason: ${req.body.rejectionReason || 'Does not meet policy'}`,
                read: false,
                createdAt: new Date(),
                type: 'order'
            });

            // Send Push Notification
            await notificationService.sendToUser(
                order.user,
                'Return/Replacement Rejected',
                `Your request for order #${req.params.id.slice(-6).toUpperCase()} has been rejected.`,
                { type: 'return_status', orderId: req.params.id, status: 'rejected' }
            );

            res.json({ message: 'Request rejected' });
        }

    } catch (error) {
        console.error('Error processing return:', error);
        res.status(500).json({ message: 'Error processing return' });
    }
});

// Process Refund Status - Admin only
router.put('/:id/refund', protect, admin, async (req, res) => {
    try {
        const { refundStatus } = req.body; // 'processing' | 'completed' | 'failed'
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Cancelled' && order.status !== 'Returned') {
            return res.status(400).json({ message: 'Order must be Cancelled or Returned to process refund' });
        }

        const updateData: any = {
            refundStatus
        };

        if (refundStatus === 'completed') {
            updateData.refundedAt = new Date();
        }

        await Order.update(req.params.id, updateData);

        // Notify user
        const statusMessages: any = {
            'processing': { title: 'Refund Processing', message: `We have initiated the refund for your order #${req.params.id.slice(-6).toUpperCase()}. It will be credited within 5-7 business days.` },
            'completed': { title: 'Refund Completed', message: `Your refund for order #${req.params.id.slice(-6).toUpperCase()} has been successfully processed.` },
            'failed': { title: 'Refund Failed', message: `There was an issue processing your refund for order #${req.params.id.slice(-6).toUpperCase()}. Please contact support.` }
        };

        const notification = statusMessages[refundStatus];

        if (notification) {
            await db.collection('users').doc(order.user).collection('notifications').add({
                title: notification.title,
                message: notification.message,
                read: false,
                createdAt: new Date(),
                type: 'order'
            });

            await notificationService.sendToUser(
                order.user,
                notification.title,
                notification.message,
                { type: 'order_refund', orderId: req.params.id, status: refundStatus }
            );
        }

        res.json({ message: 'Refund status updated successfully' });

    } catch (error) {
        console.error('Error processing refund status:', error);
        res.status(500).json({ message: 'Error processing refund status' });
    }
});

export default router;
