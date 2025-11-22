const db = require('./src/db/knex');

const fixInventory = async () => {
    try {
        // We assume that if Free to Use < On Hand, it's a bug caused by the previous logic,
        // because we don't have any "Reserved" logic yet.
        // However, we must respect that "Free to Use" might be HIGHER than On Hand (due to Incoming/Ready receipts).
        // So we only want to fix the case where we missed adding the On Hand stock to Free to Use.

        // Strategy: 
        // 1. Calculate the "expected" free_to_use based on On Hand + Incoming.
        // But we don't easily know "Incoming" without summing up all "Ready" receipts.

        // Simpler fix for the user's specific issue:
        // They have 21 On Hand, 6 Free.
        // The 21 came from manual adjustment (which added 0 to Free).
        // The 6 came from Receipt (which added 6 to Free).
        // So we are missing 21 in Free.
        // We should set Free = Free + (On Hand - (Free - Incoming?)) -- too complex.

        // Let's just set Free = On Hand + (Current Free - 0?) 
        // No.

        // Let's assume for this specific fix: 
        // Any stock currently On Hand *should* be Free to Use.
        // Any stock currently Free to Use *might* include Incoming.
        // So Free to Use = On Hand + Incoming.

        // Let's recalculate Incoming from "Ready" receipts.
        const incomingStocks = await db('receipt_lines')
            .join('receipts', 'receipt_lines.receipt_id', 'receipts.id')
            .where('receipts.status', 'ready')
            .select('receipt_lines.product_id', 'receipts.location_id', db.raw('SUM(receipt_lines.quantity) as incoming_qty'))
            .groupBy('receipt_lines.product_id', 'receipts.location_id');

        // Get all inventory
        const inventory = await db('inventory').select('*');

        for (const item of inventory) {
            const incoming = incomingStocks.find(i => i.product_id === item.product_id && i.location_id === item.location_id);
            const incomingQty = incoming ? parseInt(incoming.incoming_qty) : 0;

            // Expected Free = On Hand + Incoming
            const expectedFree = item.quantity + incomingQty;

            if (item.free_to_use !== expectedFree) {
                console.log(`Fixing Product ${item.product_id} Loc ${item.location_id}: Free ${item.free_to_use} -> ${expectedFree} (Hand ${item.quantity} + Inc ${incomingQty})`);
                await db('inventory')
                    .where({ id: item.id })
                    .update({ free_to_use: expectedFree });
            }
        }

        console.log('Inventory fix complete');
    } catch (error) {
        console.error('Error fixing inventory:', error);
    } finally {
        process.exit(0);
    }
};

fixInventory();
