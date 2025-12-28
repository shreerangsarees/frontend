import express from 'express';
import { Product } from '../models/Product';
// import Order from '../models/Order'; 
import { protect, admin } from '../middleware/auth';
import { io } from '../index';
import { db } from '../config/firebase'; // Direct DB access for some complex queries if needed

const router = express.Router();

// Get all products (with optional pagination and search)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 0; // 0 means no limit (backward compatible)
        const search = (req.query.search as string || '').toLowerCase().trim();
        const category = req.query.category as string;

        let allProducts = await Product.findAll();

        // Apply search filter
        if (search) {
            allProducts = allProducts.filter((p: any) =>
                p.name?.toLowerCase().includes(search) ||
                p.description?.toLowerCase().includes(search) ||
                p.category?.toLowerCase().includes(search)
            );
        }

        // Apply category filter (case-insensitive)
        if (category) {
            allProducts = allProducts.filter((p: any) =>
                p.category?.toLowerCase() === category.toLowerCase()
            );
        }

        if (limit === 0) {
            // No pagination - return all (backward compatible)
            return res.json(allProducts);
        }

        // Paginated response
        const total = allProducts.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const products = allProducts.slice(startIndex, endIndex);

        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Helper to get all products (cached/in-memory style)
async function getAllProducts() {
    const snapshot = await db.collection('products').get();
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
}

// Get Trending
router.get('/trending', async (req, res) => {
    try {
        const products: any[] = await getAllProducts();
        // In-memory sort by salesCount desc
        const trending = products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 10);
        res.json(trending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending products' });
    }
});

// Get Featured
router.get('/featured', async (req, res) => {
    try {
        const products: any[] = await getAllProducts();
        // In-memory sort by rating desc (or any logic)
        const featured = products.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
        res.json(featured);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching featured products' });
    }
});

// Get Top Rated
router.get('/top-rated', async (req, res) => {
    try {
        const products: any[] = await getAllProducts();
        // In-memory sort by rating
        const topRated = products.sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0)).slice(0, 10);
        res.json(topRated);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top rated products' });
    }
});

// Get Recommendations (AI/Smart Logic)
router.get('/recommendations', async (req, res) => {
    try {
        const products: any[] = await getAllProducts();

        // "Smart" Discovery Logic:
        // Score = (Rating * 20) + (Random * 50)
        // This ensures quality products appear but with variety (Discovery)
        const candidates = products.map(p => ({
            ...p,
            score: ((p.rating || 0) * 20) + (Math.random() * 50)
        }));

        // Sort by calculated score
        candidates.sort((a, b) => b.score - a.score);

        // Return top 8
        res.json(candidates.slice(0, 8));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

// Get Single Product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Create product
router.post('/', protect, admin, async (req, res) => {
    try {
        const createdProduct = await Product.create(req.body);
        if (io) io.emit('productCreated', createdProduct);
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update product
router.put('/:id', protect, admin, async (req, res) => {
    try {
        // Check if product exists
        const existing = await Product.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = await Product.update(req.params.id, req.body);
        if (io) io.emit('productUpdated', updatedProduct);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        // Check if product exists
        const existing = await Product.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.delete(req.params.id);
        if (io) io.emit('productDeleted', { productId: req.params.id });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

export default router;
