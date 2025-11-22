const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// Helper to generate reference
const generateReference = async (trx) => {
    // Format: WH/INT/0001
    const lastTransfer = await trx('transfers')
        .orderBy('id', 'desc')
        .first();

    let nextNum = 1;
    if (lastTransfer && lastTransfer.reference) {
        const parts = lastTransfer.reference.split('/');
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `WH/INT/${String(nextNum).padStart(4, '0')}`;
};

// GET /api/transfers - List transfers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const transfers = await db('transfers')
            .join('locations as source', 'transfers.source_location_id', 'source.id')
            .join('locations as dest', 'transfers.dest_location_id', 'dest.id')
            .select(
                'transfers.*',
                'source.name as source_location_name',
                'dest.name as dest_location_name'
            )
            .orderBy('created_at', 'desc');
        res.json(transfers);
    } catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ error: 'Failed to fetch transfers' });
    }
});

// GET /api/transfers/:id - Get transfer details with lines
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const transfer = await db('transfers')
            .join('locations as source', 'transfers.source_location_id', 'source.id')
            .join('locations as dest', 'transfers.dest_location_id', 'dest.id')
            .select(
                'transfers.*',
                'source.name as source_location_name',
                'dest.name as dest_location_name'
            )
            .where('transfers.id', id)
            .first();

        if (!transfer) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        const lines = await db('transfer_lines')
            .join('products', 'transfer_lines.product_id', 'products.id')
            .select(
                'transfer_lines.*',
                'products.name as product_name',
                'products.sku as product_sku'
            )
            .where('transfer_id', id);

        res.json({ ...transfer, lines });
    } catch (error) {
        console.error('Error fetching transfer details:', error);
        res.status(500).json({ error: 'Failed to fetch transfer details' });
    }
});

// POST /api/transfers - Create new transfer
router.post('/', authenticateToken, async (req, res) => {
    const { source_location_id, dest_location_id, scheduled_date, lines } = req.body;

    if (!source_location_id || !dest_location_id || !lines || lines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (source_location_id === dest_location_id) {
        return res.status(400).json({ error: 'Source and Destination cannot be the same' });
    }

    try {
        await db.transaction(async (trx) => {
            const reference = await generateReference(trx);

            const [transferId] = await trx('transfers').insert({
                reference,
                source_location_id,
                dest_location_id,
                scheduled_date,
                status: 'draft'
            }).returning('id');

            const transferIdVal = transferId.id || transferId;

            const lineInserts = lines.map(line => ({
                transfer_id: transferIdVal,
                product_id: line.product_id,
                quantity: line.quantity,
                done_quantity: 0
            }));

            await trx('transfer_lines').insert(lineInserts);

            res.status(201).json({ id: transferIdVal, reference, message: 'Transfer created' });
        });
    } catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: 'Failed to create transfer' });
    }
});

// PUT /api/transfers/:id/check-availability - Check Source stock and move to Ready
router.put('/:id/check-availability', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const transfer = await trx('transfers').where({ id }).first();
            if (!transfer) throw new Error('Transfer not found');
            if (transfer.status !== 'draft') throw new Error('Transfer must be in draft state');

            const lines = await trx('transfer_lines').where({ transfer_id: id });

            // Check availability at Source
            for (const line of lines) {
                const inventory = await trx('inventory')
                    .where({ product_id: line.product_id, location_id: transfer.source_location_id })
                    .first();

                const available = inventory ? inventory.free_to_use : 0;

                if (available < line.quantity) {
                    throw new Error(`Insufficient stock at Source for product ID ${line.product_id}. Required: ${line.quantity}, Available: ${available}`);
                }
            }

            // If all good, reserve stock at Source (decrease free_to_use)
            for (const line of lines) {
                await trx('inventory')
                    .where({ product_id: line.product_id, location_id: transfer.source_location_id })
                    .decrement('free_to_use', line.quantity);
            }

            // Update status
            await trx('transfers').where({ id }).update({ status: 'ready' });
        });

        res.json({ message: 'Stock reserved at Source. Transfer is ready.' });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/transfers/:id/validate - Move to Done state
router.put('/:id/validate', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const transfer = await trx('transfers').where({ id }).first();
            if (!transfer) throw new Error('Transfer not found');
            if (transfer.status !== 'ready') throw new Error('Transfer must be in ready state');

            // Update status
            await trx('transfers').where({ id }).update({ status: 'done' });

            const lines = await trx('transfer_lines').where({ transfer_id: id });
            for (const line of lines) {
                // Mark line as done
                await trx('transfer_lines')
                    .where({ id: line.id })
                    .update({ done_quantity: line.quantity });

                // 1. Decrease Source On Hand (quantity)
                // Note: Source Free to use was already decreased in 'check-availability'
                await trx('inventory')
                    .where({ product_id: line.product_id, location_id: transfer.source_location_id })
                    .decrement('quantity', line.quantity);

                // 2. Increase Destination On Hand AND Free to Use
                const destInventory = await trx('inventory')
                    .where({ product_id: line.product_id, location_id: transfer.dest_location_id })
                    .first();

                if (destInventory) {
                    await trx('inventory')
                        .where({ product_id: line.product_id, location_id: transfer.dest_location_id })
                        .increment('quantity', line.quantity)
                        .increment('free_to_use', line.quantity);
                } else {
                    await trx('inventory').insert({
                        product_id: line.product_id,
                        location_id: transfer.dest_location_id,
                        quantity: line.quantity,
                        free_to_use: line.quantity,
                        min_quantity: 0
                    });
                }
            }
        });

        res.json({ message: 'Transfer validated. Stock moved.' });
    } catch (error) {
        console.error('Error validating transfer:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
