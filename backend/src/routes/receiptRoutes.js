const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// Helper to generate reference
const generateReference = async (trx) => {
    // Format: WH/IN/0001
    const lastReceipt = await trx('receipts')
        .orderBy('id', 'desc')
        .first();

    let nextNum = 1;
    if (lastReceipt && lastReceipt.reference) {
        const parts = lastReceipt.reference.split('/');
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `WH/IN/${String(nextNum).padStart(4, '0')}`;
};

// GET /api/receipts - List receipts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const receipts = await db('receipts')
            .join('contacts', 'receipts.contact_id', 'contacts.id')
            .join('locations', 'receipts.location_id', 'locations.id')
            .select(
                'receipts.*',
                'contacts.name as contact_name',
                'locations.name as location_name'
            )
            .orderBy('created_at', 'desc');
        res.json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
});

// GET /api/receipts/:id - Get receipt details with lines
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const receipt = await db('receipts')
            .join('contacts', 'receipts.contact_id', 'contacts.id')
            .join('locations', 'receipts.location_id', 'locations.id')
            .select(
                'receipts.*',
                'contacts.name as contact_name',
                'locations.name as location_name'
            )
            .where('receipts.id', id)
            .first();

        if (!receipt) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const lines = await db('receipt_lines')
            .join('products', 'receipt_lines.product_id', 'products.id')
            .select(
                'receipt_lines.*',
                'products.name as product_name',
                'products.sku as product_sku'
            )
            .where('receipt_id', id);

        res.json({ ...receipt, lines });
    } catch (error) {
        console.error('Error fetching receipt details:', error);
        res.status(500).json({ error: 'Failed to fetch receipt details' });
    }
});

// POST /api/receipts - Create new receipt
router.post('/', authenticateToken, async (req, res) => {
    const { contact_id, location_id, scheduled_date, lines } = req.body;

    if (!contact_id || !location_id || !lines || lines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.transaction(async (trx) => {
            const reference = await generateReference(trx);

            const [receiptId] = await trx('receipts').insert({
                reference,
                contact_id,
                location_id,
                scheduled_date,
                status: 'draft'
            }).returning('id');

            const receiptIdVal = receiptId.id || receiptId;

            const lineInserts = lines.map(line => ({
                receipt_id: receiptIdVal,
                product_id: line.product_id,
                quantity: line.quantity,
                done_quantity: 0
            }));

            await trx('receipt_lines').insert(lineInserts);

            res.status(201).json({ id: receiptIdVal, reference, message: 'Receipt created' });
        });
    } catch (error) {
        console.error('Error creating receipt:', error);
        res.status(500).json({ error: 'Failed to create receipt' });
    }
});

// PUT /api/receipts/:id/confirm - Move to Ready state
router.put('/:id/confirm', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const receipt = await trx('receipts').where({ id }).first();
            if (!receipt) throw new Error('Receipt not found');
            if (receipt.status !== 'draft') throw new Error('Receipt must be in draft state');

            // Update status
            await trx('receipts').where({ id }).update({ status: 'ready' });

            // Increase Free To Use stock
            const lines = await trx('receipt_lines').where({ receipt_id: id });
            for (const line of lines) {
                const existing = await trx('inventory')
                    .where({ product_id: line.product_id, location_id: receipt.location_id })
                    .first();

                if (existing) {
                    await trx('inventory')
                        .where({ product_id: line.product_id, location_id: receipt.location_id })
                        .increment('free_to_use', line.quantity);
                } else {
                    await trx('inventory').insert({
                        product_id: line.product_id,
                        location_id: receipt.location_id,
                        quantity: 0,
                        free_to_use: line.quantity,
                        min_quantity: 0
                    });
                }
            }
        });

        res.json({ message: 'Receipt confirmed' });
    } catch (error) {
        console.error('Error confirming receipt:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/receipts/:id/validate - Move to Done state
router.put('/:id/validate', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const receipt = await trx('receipts').where({ id }).first();
            if (!receipt) throw new Error('Receipt not found');
            if (receipt.status !== 'ready') throw new Error('Receipt must be in ready state');

            // Update status
            await trx('receipts').where({ id }).update({ status: 'done' });

            // Update lines done_quantity to match quantity (assuming full receipt for now)
            // And update inventory: Increase On Hand (quantity), Decrease Free To Use (if we consider it reserved, but user said "add that stock in free to use" on ready. 
            // Let's re-read: "if its in ready stage then the product free to use quantity will be updated and add that stock in free to use"
            // "if its validated ... then the stock adds in on hand quant"
            // Usually, "Free to use" = On Hand - Reserved. 
            // If "Ready" means "Incoming", maybe it shouldn't be "Free to use" yet? 
            // User said: "if its in ready stage then the product free to use quantity will be updated and add that stock in free to use" -> This implies incoming goods are considered free to use? That's unusual but I will follow instructions.
            // Wait, if I add to Free To Use on Ready, and then Add to On Hand on Validate, do I remove from Free To Use?
            // User said: "if its validated ... then the stock adds in on hand quant"
            // Usually On Hand is the physical stock. Free to use is what you can sell.
            // If I receive goods, they become On Hand AND Free to Use.
            // If "Ready" adds to Free to Use, it means we can sell them before they arrive? (Dropshipping/Pre-order logic).
            // Let's assume:
            // Ready: +Free To Use (Virtual stock increase)
            // Validate: +On Hand (Physical stock increase). 
            // Does Validate also change Free To Use? 
            // If I already added to Free To Use in Ready, I shouldn't add it again in Validate.
            // But usually On Hand increase implies Free To Use increase unless reserved.
            // Let's stick to:
            // Ready: +Free To Use
            // Validate: +On Hand. (And leave Free To Use as is, since it was already added).

            const lines = await trx('receipt_lines').where({ receipt_id: id });
            for (const line of lines) {
                // Mark line as done
                await trx('receipt_lines')
                    .where({ id: line.id })
                    .update({ done_quantity: line.quantity });

                // Increase On Hand
                await trx('inventory')
                    .where({ product_id: line.product_id, location_id: receipt.location_id })
                    .increment('quantity', line.quantity);
            }
        });

        res.json({ message: 'Receipt validated' });
    } catch (error) {
        console.error('Error validating receipt:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
