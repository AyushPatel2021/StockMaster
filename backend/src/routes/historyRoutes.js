const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/history - Get combined history of operations
router.get('/', authenticateToken, async (req, res) => {
    try {
        // 1. Fetch Receipts
        const receipts = await db('receipts')
            .join('contacts', 'receipts.contact_id', 'contacts.id')
            .select(
                'receipts.id',
                'receipts.reference',
                'receipts.created_at',
                'receipts.status',
                'contacts.name as partner_name',
                db.raw("'receipt' as type")
            );

        // 2. Fetch Deliveries
        const deliveries = await db('deliveries')
            .join('contacts', 'deliveries.contact_id', 'contacts.id')
            .select(
                'deliveries.id',
                'deliveries.reference',
                'deliveries.created_at',
                'deliveries.status',
                'contacts.name as partner_name',
                db.raw("'delivery' as type")
            );

        // 3. Fetch Transfers
        const transfers = await db('transfers')
            .join('locations as source', 'transfers.source_location_id', 'source.id')
            .join('locations as dest', 'transfers.dest_location_id', 'dest.id')
            .select(
                'transfers.id',
                'transfers.reference',
                'transfers.created_at',
                'transfers.status',
                db.raw("source.name || ' → ' || dest.name as partner_name"),
                db.raw("'transfer' as type")
            );

        // Combine and Sort
        const history = [...receipts, ...deliveries, ...transfers].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
