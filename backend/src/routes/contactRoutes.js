const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/contacts - List all contacts (optionally filter by type)
router.get('/', authenticateToken, async (req, res) => {
    const { type } = req.query;
    try {
        let query = db('contacts').select('*');
        if (type) {
            query = query.where({ type });
        }
        const contacts = await query;
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// POST /api/contacts - Create a new contact
router.post('/', authenticateToken, async (req, res) => {
    const { name, type, email, phone } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const [id] = await db('contacts').insert({
            name,
            type: type || 'vendor',
            email,
            phone
        }).returning('id');

        const newContact = await db('contacts').where({ id: id.id || id }).first();
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Contact name already exists' });
        }
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

module.exports = router;
