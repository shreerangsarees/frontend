import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

// Import config
import connectDB from './config/db';
import { seedAdmin, seedCoupons } from './config/seed';
import './config/passport'; // Initialize passport strategies

// Import routes
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import settingsRoutes from './routes/settingsRoutes';
import categoryRoutes from './routes/categoryRoutes';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io setup - allow production frontend URLs
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    process.env.FRONTEND_URL // Add your Netlify URL here
].filter((origin): origin is string => Boolean(origin));

export const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room for specific order tracking
    socket.on('joinOrderRoom', (orderId: string) => {
        socket.join(`order-${orderId}`);
        console.log(`Socket ${socket.id} joined room order-${orderId}`);
    });

    // Join admin room for new order notifications
    socket.on('joinAdminRoom', () => {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to Database
connectDB().then(() => {
    seedAdmin();
    seedCoupons();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('T-Mart Express API is running with Socket.io');
});

// Start Server with Socket.io
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} with Socket.io enabled`);
});

