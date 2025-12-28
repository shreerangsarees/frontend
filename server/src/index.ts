import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/firebase'; // Ensure Firebase Admin is initialized

dotenv.config();

// Import routes
import productRoutes from './routes/productRoutes';
// import authRoutes from './routes/authRoutes'; // Deprecated
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import settingsRoutes from './routes/settingsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reviewRoutes from './routes/reviewRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import bannerRoutes from './routes/bannerRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import notificationRoutes from './routes/notificationRoutes';
import blogRoutes from './routes/blogRoutes';
import uploadRoutes from './routes/uploadRoutes';

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
        origin: true, // Allow any origin for development
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

    // Join user-specific room for order notifications
    socket.on('joinUserRoom', (data: { userId: string }) => {
        if (data.userId) {
            socket.join(`user-${data.userId}`);
            console.log(`Socket ${socket.id} joined user room user-${data.userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' })); // Increased for base64 images

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Routes
app.use('/api/products', productRoutes);
// app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Shreerang Saree API is running with Firebase & Socket.io');
});

// Start Server
const startServer = async () => {
    try {
        // No MongoDB connection needed

        // Seeding logic would need to be rewritten for Firestore
        // seedAdmin(); 

        httpServer.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} with Firebase enabled`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
