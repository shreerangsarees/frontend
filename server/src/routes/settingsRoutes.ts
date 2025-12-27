import express from 'express';
import { Settings } from '../models/Settings';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// Update settings
router.put('/', protect, admin, async (req, res) => {
    try {
        const settings = await Settings.updateSettings(req.body);
        res.json(settings);
    } catch (error) {
        console.error("Error updating settings", error);
        res.status(500).json({ message: 'Error updating settings' });
    }
});

export default router;
