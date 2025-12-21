import express from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Simple Settings Schema (Singleton)
const SettingsSchema = new mongoose.Schema({
    storeName: { type: String, default: 'T-Mart Express' },
    deliveryFee: { type: Number, default: 40 },
    minOrderFreeDelivery: { type: Number, default: 499 }
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// Get Settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// Update Settings
router.put('/', protect, admin, async (req, res) => {
    try {
        const { storeName, deliveryFee, minOrderFreeDelivery } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        settings.storeName = storeName;
        settings.deliveryFee = deliveryFee;
        settings.minOrderFreeDelivery = minOrderFreeDelivery;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
});

export default router;
