import express from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Update Profile (Password, Name)
router.put('/profile', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { name, currentPassword, newPassword } = req.body;
        const user = await User.findById((req.user as any)._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;

        if (newPassword) {
            if (currentPassword) {
                const pwdString: string = String(currentPassword);
                const userPwd: string = (user as any).password;
                const isMatch = await bcrypt.compare(pwdString, userPwd);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Incorrect current password' });
                }
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Add Address
router.post('/address', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById((req.user as any)._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { label, full_address, city, pincode, is_default } = req.body;

        if (is_default) {
            user.addresses.forEach(a => a.is_default = false);
        }

        user.addresses.push({ label, full_address, city, pincode, is_default: is_default || user.addresses.length === 0 });
        await user.save();
        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error adding address' });
    }
});

// Delete Address
router.delete('/address/:id', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById((req.user as any)._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.filter(a => a._id?.toString() !== req.params.id);
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address' });
    }
});

export default router;
