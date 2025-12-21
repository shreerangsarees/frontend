import express from 'express';
import Coupon from '../models/Coupon';

const router = express.Router();

// Create Coupon (Admin)
router.post('/', async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error });
    }
});

// Get all coupons (Admin)
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// Get active public coupons
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: now }
        });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active coupons' });
    }
});

// Validate Coupon
router.post('/validate', async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon' });
        }

        if (orderAmount < coupon.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order amount of ₹${coupon.minOrderValue} required`
            });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Validation failed' });
    }
});

// Delete Coupon
router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
});

export default router;
