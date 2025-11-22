const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// Middleware to check for Admin role
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// GET /api/categories - List all categories
router.get('/', authenticateToken, async (req, res) => {
    try {
        const categories = await db('categories').orderBy('name', 'asc');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/categories - Create category (Admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, description } = req.body;
    try {
        const [newCategory] = await db('categories').insert({
            name,
            description
        }).returning('*');
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Category name must be unique' });
        }
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update category (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const [updatedCategory] = await db('categories')
            .where({ id })
            .update({ name, description, updated_at: db.fn.now() })
            .returning('*');

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Category name must be unique' });
        }
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('categories').where({ id }).del();
        if (!deletedCount) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
