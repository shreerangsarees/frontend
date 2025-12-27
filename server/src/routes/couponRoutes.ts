import express from 'express';
import { Coupon } from '../models/Coupon';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Validate coupon
router.post('/validate', async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        const coupon = await Coupon.findByCode(code);

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Coupon is inactive' });
        }

        // Robust date check
        let expiry: Date;
        if (coupon.expiryDate && typeof coupon.expiryDate === 'object' && '_seconds' in coupon.expiryDate) {
            expiry = new Date((coupon.expiryDate as any)._seconds * 1000);
        } else {
            expiry = new Date(coupon.expiryDate);
        }

        if (expiry < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (orderTotal < coupon.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`
            });
        }

        res.json(coupon);
    } catch (error) {
        console.error('Error verifying coupon:', error);
        res.status(500).json({ message: 'Error verifying coupon' });
    }
});

// Get active coupons (Public)
router.get('/active', async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        const now = new Date();

        const activeCoupons = coupons.filter(c => {
            if (!c.isActive) return false;

            let expiry: Date;
            if (c.expiryDate && typeof c.expiryDate === 'object' && '_seconds' in c.expiryDate) {
                expiry = new Date((c.expiryDate as any)._seconds * 1000);
            } else {
                expiry = new Date(c.expiryDate);
            }

            return expiry > now;
        });

        res.json(activeCoupons);
    } catch (error) {
        console.error('Error fetching active coupons:', error);
        res.status(500).json({ message: 'Error fetching active coupons' });
    }
});

// Get all coupons (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// Create coupon (Admin)
router.post('/', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon' });
    }
});

// Update coupon (Admin)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.update(req.params.id, req.body);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon' });
    }
});

// Delete coupon (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Coupon.delete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
});

export default router;
