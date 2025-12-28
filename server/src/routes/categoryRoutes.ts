import express from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { protect, admin } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Get all categories with dynamic product counts
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        const products: any[] = await Product.findAll();

        // Calculate counts manually since Firestore doesn't specialize in aggregation pipelines like Mongo
        const countMap: { [key: string]: number } = {};
        products.forEach((p: any) => {
            if (p.category) {
                countMap[p.category] = (countMap[p.category] || 0) + 1;
            }
        });

        const categoriesWithCounts = categories.map((cat: any) => ({
            ...cat,
            productCount: countMap[cat.name] || 0
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Get occasion categories only (for Shop by Occasion section)
router.get('/occasions', async (req, res) => {
    try {
        const categories = await Category.findAll();
        const occasions = categories.filter((cat: any) => cat.type === 'occasion');
        res.json(occasions);
    } catch (error) {
        console.error('Error fetching occasions:', error);
        res.status(500).json({ message: 'Error fetching occasion categories' });
    }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category' });
    }
});

// Create category (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, image, icon, description, type, color } = req.body;
        // Check uniqueness manually
        const categories: any[] = await Category.findAll();
        const exists = categories.find(c => c.name === name);

        if (exists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await Category.create({
            name,
            image,
            icon,
            description,
            productCount: 0,
            type: type || 'regular',
            color: color || undefined
        });

        // Emit real-time event
        if (io) io.emit('categoryCreated', category);

        res.status(201).json(category);
    } catch (error) {
        console.error('Error fetching categories with counts:', error);
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update category (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.update(req.params.id, req.body);
        if (category) {
            if (io) io.emit('categoryUpdated', category);
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete category (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Category.delete(req.params.id);
        if (io) io.emit('categoryDeleted', { categoryId: req.params.id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
});

export default router;
