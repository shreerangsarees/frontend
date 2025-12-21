import express from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all categories with dynamic product counts
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});

        // Get product counts per category
        const productCounts = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Create a map for quick lookup
        const countMap: { [key: string]: number } = {};
        productCounts.forEach((item: any) => {
            countMap[item._id] = item.count;
        });

        // Add product count to each category
        const categoriesWithCounts = categories.map((cat: any) => ({
            ...cat.toObject(),
            productCount: countMap[cat.name] || 0
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Create category (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, image, icon, description } = req.body;
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await Category.create({ name, image, icon, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update category (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, image, icon, description } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.image = image || category.image;
            category.icon = icon || category.icon;
            category.description = description || category.description;

            const updatedCategory = await category.save();
            res.json(updatedCategory);
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
        const category = await Category.findById(req.params.id);

        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
});

export default router;
