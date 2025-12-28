import express from 'express';
import { protect, admin } from '../middleware/auth';
import { User } from '../models/User';
import { auth } from '../config/firebase'; // Admin Auth

const router = express.Router();

// @route   POST /api/users/sync
// @desc    Sync Firebase Auth user with Firestore (Called after frontend login/signup)
// @access  Private
router.post('/sync', protect, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.user; // from protect middleware decoding token

        // We can just use the User service to ensure existence or update
        // Prioritize req.body (frontend data) over token data for display name
        const syncData = {
            uid,
            email,
            displayName: req.body.name || name, // Prefer body name, fallback to token
            photoURL: picture
        };

        // Log the incoming data for debugging


        const user = await User.create(syncData as any, req.body);
        if (process.env.NODE_ENV === 'development') {
            console.log('User synced successfully:', user?.uid);
        }

        res.json(user);
    } catch (error: any) {
        console.error('Sync Error Trace:', error);
        res.status(500).json({
            message: 'Server Error during Sync',
            error: error.message,
            stack: error.stack
        });
    }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.uid);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const updatedUser = await User.update(req.user.uid, req.body);
        res.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/users/address
// @desc    Add a new address
// @access  Private
router.post('/address', protect, async (req, res) => {
    try {
        const newAddress = req.body;


        if (!newAddress.phone || !newAddress.full_address || !newAddress.pincode) {
            return res.status(400).json({ message: 'Missing required fields (phone, full_address, pincode)' });
        }

        const user = await User.findById(req.user.uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addresses = user.addresses || [];

        // If set as default, unset others
        if (newAddress.is_default) {
            addresses.forEach((a: any) => a.is_default = false);
        }

        addresses.push({ ...newAddress, id: new Date().getTime().toString() }); // Add basic ID

        await User.update(req.user.uid, { addresses });

        res.json({ message: 'Address added successfully', addresses });
    } catch (error: any) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
// @route   POST /api/users/fcm-token
// @desc    Register or update FCM Token
// @access  Private
router.post('/fcm-token', protect, async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const user = await User.findById(req.user.uid);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const tokens = user.fcmTokens || [];
        if (!tokens.includes(token)) {
            tokens.push(token);
            await User.update(req.user.uid, { fcmTokens: tokens });
        }

        res.json({ message: 'Token registered' });
    } catch (error: any) {
        console.error('Error registering FCM token:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { db } = require('../config/firebase'); // Keep or move to top if preferable
        const snapshot = await db.collection('users').get();
        // Map to include valid _id for frontend
        const users = snapshot.docs.map((doc: any) => ({
            _id: doc.id,
            ...doc.data()
        }));
        res.json(users);

    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
    try {
        const { role } = req.body;
        const MASTER_ADMIN_EMAIL = 'admin@shreerang.com';

        if (!['customer', 'admin', 'delivery'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Prevent changing master admin's role
        const { db } = require('../config/firebase');
        const userDoc = await db.collection('users').doc(req.params.id).get();
        if (userDoc.exists && userDoc.data()?.email === MASTER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Cannot change master admin role' });
        }

        await db.collection('users').doc(req.params.id).update({ role });

        // Also update Firebase Auth custom claims if needed
        try {
            await auth.setCustomUserClaims(req.params.id, { role });
        } catch (e) {
            console.warn('Could not update custom claims', e);
        }

        res.json({ message: 'Role updated successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const { db } = require('../config/firebase');

        // Delete from Firestore
        await db.collection('users').doc(req.params.id).delete();

        // Also delete from Firebase Auth
        try {
            await auth.deleteUser(req.params.id);
        } catch (e) {
            console.warn('Could not delete from Auth', e);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
