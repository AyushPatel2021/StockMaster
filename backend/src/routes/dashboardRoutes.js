const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // 1. Total Products
        const totalProductsResult = await db('products').count('id as count').first();
        const totalProducts = parseInt(totalProductsResult.count);

        // 2. Low Stock Alerts (products where quantity <= min_quantity)
        // We need to check inventory per location or aggregate. 
        // For simplicity, let's count inventory records where quantity <= min_quantity
        const lowStockResult = await db('inventory')
            .whereRaw('quantity <= min_quantity')
            .count('id as count')
            .first();
        const lowStockCount = parseInt(lowStockResult.count);

        // 3. Pending Receipts (Draft or Ready)
        const pendingReceiptsResult = await db('receipts')
            .whereIn('status', ['draft', 'ready'])
            .count('id as count')
            .first();
        const pendingReceipts = parseInt(pendingReceiptsResult.count);

        // 4. Pending Deliveries (Draft or Ready)
        const pendingDeliveriesResult = await db('deliveries')
            .whereIn('status', ['draft', 'ready'])
            .count('id as count')
            .first();
        const pendingDeliveries = parseInt(pendingDeliveriesResult.count);

        // 5. Recent Activity (Last 5 operations)
        // Reuse logic from history but limit to 5. 
        // Note: Doing a full union and sort might be heavy if data is huge, but fine for now.
        const receipts = await db('receipts')
            .join('contacts', 'receipts.contact_id', 'contacts.id')
            .select('receipts.reference', 'receipts.created_at', 'receipts.status', db.raw("'receipt' as type"))
            .orderBy('created_at', 'desc')
            .limit(5);

        const deliveries = await db('deliveries')
            .join('contacts', 'deliveries.contact_id', 'contacts.id')
            .select('deliveries.reference', 'deliveries.created_at', 'deliveries.status', db.raw("'delivery' as type"))
            .orderBy('created_at', 'desc')
            .limit(5);

        const transfers = await db('transfers')
            .select('transfers.reference', 'transfers.created_at', 'transfers.status', db.raw("'transfer' as type"))
            .orderBy('created_at', 'desc')
            .limit(5);

        const recentActivity = [...receipts, ...deliveries, ...transfers]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        res.json({
            totalProducts,
            lowStockCount,
            pendingReceipts,
            pendingDeliveries,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
