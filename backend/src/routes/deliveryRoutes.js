const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const authenticateToken = require('../middleware/authMiddleware');

// Helper to generate reference
const generateReference = async (trx) => {
    // Format: WH/OUT/0001
    const lastDelivery = await trx('deliveries')
        .orderBy('id', 'desc')
        .first();

    let nextNum = 1;
    if (lastDelivery && lastDelivery.reference) {
        const parts = lastDelivery.reference.split('/');
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `WH/OUT/${String(nextNum).padStart(4, '0')}`;
};

// GET /api/deliveries - List deliveries
router.get('/', authenticateToken, async (req, res) => {
    try {
        const deliveries = await db('deliveries')
            .join('contacts', 'deliveries.contact_id', 'contacts.id')
            .join('locations', 'deliveries.location_id', 'locations.id')
            .select(
                'deliveries.*',
                'contacts.name as contact_name',
                'locations.name as location_name'
            )
            .orderBy('created_at', 'desc');
        res.json(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

// GET /api/deliveries/:id - Get delivery details with lines
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const delivery = await db('deliveries')
            .join('contacts', 'deliveries.contact_id', 'contacts.id')
            .join('locations', 'deliveries.location_id', 'locations.id')
            .select(
                'deliveries.*',
                'contacts.name as contact_name',
                'locations.name as location_name'
            )
            .where('deliveries.id', id)
            .first();

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        const lines = await db('delivery_lines')
            .join('products', 'delivery_lines.product_id', 'products.id')
            .select(
                'delivery_lines.*',
                'products.name as product_name',
                'products.sku as product_sku'
            )
            .where('delivery_id', id);

        res.json({ ...delivery, lines });
    } catch (error) {
        console.error('Error fetching delivery details:', error);
        res.status(500).json({ error: 'Failed to fetch delivery details' });
    }
});

// POST /api/deliveries - Create new delivery
router.post('/', authenticateToken, async (req, res) => {
    const { contact_id, location_id, scheduled_date, lines } = req.body;

    if (!contact_id || !location_id || !lines || lines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.transaction(async (trx) => {
            const reference = await generateReference(trx);

            const [deliveryId] = await trx('deliveries').insert({
                reference,
                contact_id,
                location_id,
                scheduled_date,
                status: 'draft'
            }).returning('id');

            const deliveryIdVal = deliveryId.id || deliveryId;

            const lineInserts = lines.map(line => ({
                delivery_id: deliveryIdVal,
                product_id: line.product_id,
                quantity: line.quantity,
                done_quantity: 0
            }));

            await trx('delivery_lines').insert(lineInserts);

            res.status(201).json({ id: deliveryIdVal, reference, message: 'Delivery created' });
        });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ error: 'Failed to create delivery' });
    }
});

// PUT /api/deliveries/:id/check-availability - Check stock and move to Ready
router.put('/:id/check-availability', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const delivery = await trx('deliveries').where({ id }).first();
            if (!delivery) throw new Error('Delivery not found');
            if (delivery.status !== 'draft') throw new Error('Delivery must be in draft state');

            const lines = await trx('delivery_lines').where({ delivery_id: id });

            // Check availability for all lines
            for (const line of lines) {
                const inventory = await trx('inventory')
                    .where({ product_id: line.product_id, location_id: delivery.location_id })
                    .first();

                const available = inventory ? inventory.free_to_use : 0;

                if (available < line.quantity) {
                    throw new Error(`Insufficient stock for product ID ${line.product_id}. Required: ${line.quantity}, Available: ${available}`);
                }
            }

            // If all good, reserve stock (decrease free_to_use)
            for (const line of lines) {
                await trx('inventory')
                    .where({ product_id: line.product_id, location_id: delivery.location_id })
                    .decrement('free_to_use', line.quantity);
            }

            // Update status
            await trx('deliveries').where({ id }).update({ status: 'ready' });
        });

        res.json({ message: 'Stock reserved. Delivery is ready.' });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/deliveries/:id/validate - Move to Done state
router.put('/:id/validate', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await db.transaction(async (trx) => {
            const delivery = await trx('deliveries').where({ id }).first();
            if (!delivery) throw new Error('Delivery not found');
            if (delivery.status !== 'ready') throw new Error('Delivery must be in ready state');

            // Update status
            await trx('deliveries').where({ id }).update({ status: 'done' });

            const lines = await trx('delivery_lines').where({ delivery_id: id });
            for (const line of lines) {
                // Mark line as done
                await trx('delivery_lines')
                    .where({ id: line.id })
                    .update({ done_quantity: line.quantity });

                // Decrease On Hand (quantity)
                // Note: Free to use was already decreased in 'check-availability'
                await trx('inventory')
                    .where({ product_id: line.product_id, location_id: delivery.location_id })
                    .decrement('quantity', line.quantity);
            }
        });

        res.json({ message: 'Delivery validated' });
    } catch (error) {
        console.error('Error validating delivery:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
