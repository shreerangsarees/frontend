import express from 'express';
// We don't really need backend login routes anymore because Client SDK handles login.
// But we might keep this for session management if we were using cookies, 
// OR we just use this to verify the token and establish a local session logic if needed 
// (though we chose stateless JWT via Firebase).

// In this architecture, /api/auth/login is NOT needed on backend. 
// The frontend calls Firebase -> gets Token -> calls /api/users/sync or just sends Token in header.

// However, to avoid breaking frontend calls immediately, let's look at what was there.
// If the frontend expects a POST /api/auth/login, we should probably change the FRONTEND to not call it, 
// OR we implement a verification endpoint here.

const router = express.Router();

// @route   POST /api/auth/google
// @desc    Google auth callback - DEPRECATED in favor of Client SDK
router.post('/google', (req, res) => {
    res.status(400).json({ message: 'Please use Firebase Client SDK' });
});

// @route   POST /api/auth/login
// @desc    Auth user & get token - DEPRECATED
router.post('/login', (req, res) => {
    res.status(400).json({ message: 'Please use Firebase Client SDK' });
});

export default router;
