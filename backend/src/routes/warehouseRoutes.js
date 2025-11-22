const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// Middleware to check for Admin or InventoryManager role
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// GET /api/warehouses - List all warehouses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const warehouses = await db('warehouses').orderBy('created_at', 'desc');
        res.json(warehouses);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({ error: 'Failed to fetch warehouses' });
    }
});

// POST /api/warehouses - Create warehouse (Admin/Manager only)
router.post('/', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { name, short_code, address } = req.body;
    try {
        const [newWarehouse] = await db('warehouses').insert({
            name,
            short_code,
            address
        }).returning('*');
        res.status(201).json(newWarehouse);
    } catch (error) {
        console.error('Error creating warehouse:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Short code must be unique' });
        }
        res.status(500).json({ error: 'Failed to create warehouse' });
    }
});

// PUT /api/warehouses/:id - Update warehouse (Admin/Manager only)
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { id } = req.params;
    const { name, short_code, address } = req.body;
    try {
        const [updatedWarehouse] = await db('warehouses')
            .where({ id })
            .update({ name, short_code, address, updated_at: db.fn.now() })
            .returning('*');

        if (!updatedWarehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.json(updatedWarehouse);
    } catch (error) {
        console.error('Error updating warehouse:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Short code must be unique' });
        }
        res.status(500).json({ error: 'Failed to update warehouse' });
    }
});

// DELETE /api/warehouses/:id - Delete warehouse (Admin/Manager only)
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('warehouses').where({ id }).del();
        if (!deletedCount) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        res.status(500).json({ error: 'Failed to delete warehouse' });
    }
});

module.exports = router;
