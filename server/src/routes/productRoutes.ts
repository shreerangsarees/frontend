import express from 'express';
import Product from '../models/Product';
import Order from '../models/Order'; // Needed for recommendations based on history
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get Trending (Highly Ordered)
router.get('/trending', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ salesCount: -1 }).limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending products' });
    }
});

// Get Featured Products (Mix of high rating + popular)
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({})
            .sort({ averageRating: -1, salesCount: -1 })
            .limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching featured products' });
    }
});

// Get Top Rated (Best Choice)
router.get('/top-rated', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ averageRating: -1 }).limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top rated products' });
    }
});

// Get Recommendations (AI/Behavior based)
router.get('/recommendations', async (req, res) => {
    try {
        let recommendedProducts: any[] = [];

        if (req.user) {
            // 1. Get user's past orders
            const userId = (req.user as any)._id;
            const orders = await Order.find({ user: userId }).populate('items.product');

            // 2. Extract recent categories
            const categories = new Set<string>();
            orders.forEach((order: any) => {
                order.items.forEach((item: any) => {
                    if (item.product && item.product.category) {
                        categories.add(item.product.category);
                    }
                });
            });

            // 3. Fetch products from these categories (excluding purchased if needed, but simple for now)
            if (categories.size > 0) {
                recommendedProducts = await Product.find({
                    category: { $in: Array.from(categories) }
                }).limit(10);
            }
        }

        // Fallback: If no user history or low results, show trending
        if (recommendedProducts.length < 5) {
            const trending = await Product.find({}).sort({ salesCount: -1 }).limit(10 - recommendedProducts.length);
            recommendedProducts = [...recommendedProducts, ...trending];
        }

        // Remove duplicates just in case
        const uniqueProducts = Array.from(new Set(recommendedProducts.map(p => p._id.toString())))
            .map(id => recommendedProducts.find(p => p._id.toString() === id));

        res.json(uniqueProducts);

    } catch (error) {
        // Fallback to generic trending on error
        const trending = await Product.find({}).sort({ salesCount: -1 }).limit(10);
        res.json(trending);
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

// Rate Product
router.post('/:id/rate', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { rating, review } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const user = req.user as any;
            const existingRating = product.ratings.find(r => r.user.toString() === user._id.toString());

            if (existingRating) {
                existingRating.rating = Number(rating);
                existingRating.review = review;
                existingRating.date = new Date();
            } else {
                product.ratings.push({
                    user: user._id,
                    name: user.name,
                    rating: Number(rating),
                    review,
                    date: new Date()
                });
            }

            // Recalculate Average
            const total = product.ratings.reduce((acc, item) => item.rating + acc, 0);
            product.averageRating = total / product.ratings.length;

            await product.save();
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error rating product' });
    }
});

// Create product
router.post('/', protect, admin, async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update product
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Get Categories with images
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    image: { $first: "$image" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    id: "$_id",
                    name: "$_id",
                    image: 1,
                    itemCount: "$count"
                }
            }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

export default router;
