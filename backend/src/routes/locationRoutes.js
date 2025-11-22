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

// GET /api/locations - List all locations with warehouse info
router.get('/', authenticateToken, async (req, res) => {
    try {
        const locations = await db('locations')
            .join('warehouses', 'locations.warehouse_id', 'warehouses.id')
            .select('locations.*', 'warehouses.name as warehouse_name', 'warehouses.short_code as warehouse_code')
            .orderBy('locations.created_at', 'desc');
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

// POST /api/locations - Create location (Admin/Manager only)
router.post('/', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { name, short_code, warehouse_id } = req.body;
    try {
        const [newLocation] = await db('locations').insert({
            name,
            short_code,
            warehouse_id
        }).returning('*');
        res.status(201).json(newLocation);
    } catch (error) {
        console.error('Error creating location:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Short code must be unique' });
        }
        res.status(500).json({ error: 'Failed to create location' });
    }
});

// PUT /api/locations/:id - Update location (Admin/Manager only)
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { id } = req.params;
    const { name, short_code, warehouse_id } = req.body;
    try {
        const [updatedLocation] = await db('locations')
            .where({ id })
            .update({ name, short_code, warehouse_id, updated_at: db.fn.now() })
            .returning('*');

        if (!updatedLocation) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(updatedLocation);
    } catch (error) {
        console.error('Error updating location:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Short code must be unique' });
        }
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// DELETE /api/locations/:id - Delete location (Admin/Manager only)
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'InventoryManager']), async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('locations').where({ id }).del();
        if (!deletedCount) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

module.exports = router;
