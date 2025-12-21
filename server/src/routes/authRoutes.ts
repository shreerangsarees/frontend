import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            provider: 'email',
            role: (role === 'admin') ? 'customer' : (role || 'customer') // Prevent admin registration via public API
        });

        await user.save();

        // Log user in
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(user);
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info?.message || 'Login failed' });

        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(user);
        });
    })(req, res, next);
});

// Google Auth
// ... (rest of Google Auth)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/auth?error=true' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:5173/');
    }
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: 'http://localhost:5173/auth?error=true' }),
    (req, res) => {
        res.redirect('http://localhost:5173/');
    }
);

// Get current user
router.get('/current_user', (req, res) => {
    res.json(req.user || null);
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('http://localhost:5173/');
    });
});

export default router;
