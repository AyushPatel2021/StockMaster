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

// GET /api/products - List all products with category name and total stock
router.get('/', authenticateToken, async (req, res) => {
    try {
        const products = await db('products')
            .leftJoin('categories', 'products.category_id', 'categories.id')
            .leftJoin('inventory', 'products.id', 'inventory.product_id')
            .select(
                'products.*',
                'categories.name as category_name',
                db.raw('COALESCE(SUM(inventory.quantity), 0) as total_stock')
            )
            .groupBy('products.id', 'categories.name')
            .orderBy('products.name', 'asc');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get single product details
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db('products').where({ id }).first();
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products - Create product (Admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, sku, description, category_id, price, cost } = req.body;
    try {
        const [newProduct] = await db('products').insert({
            name,
            sku,
            description,
            category_id,
            price,
            cost
        }).returning('*');
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'SKU must be unique' });
        }
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, sku, description, category_id, price, cost } = req.body;
    try {
        const [updatedProduct] = await db('products')
            .where({ id })
            .update({ name, sku, description, category_id, price, cost, updated_at: db.fn.now() })
            .returning('*');

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'SKU must be unique' });
        }
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('products').where({ id }).del();
        if (!deletedCount) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// GET /api/products/:id/inventory - Get inventory for a product
router.get('/:id/inventory', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Get all locations first
        const locations = await db('locations').select('*');

        // Get existing inventory for this product
        const inventory = await db('inventory').where({ product_id: id });

        // Merge locations with inventory data
        const result = locations.map(loc => {
            const inv = inventory.find(i => i.location_id === loc.id);
            return {
                location_id: loc.id,
                location_name: loc.name,
                quantity: inv ? inv.quantity : 0,
                min_quantity: inv ? inv.min_quantity : 0
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching product inventory:', error);
        res.status(500).json({ error: 'Failed to fetch product inventory' });
    }
});

// POST /api/products/:id/inventory - Update inventory for a location (Admin only)
router.post('/:id/inventory', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { location_id, min_quantity } = req.body;

    try {
        // Check if record exists
        const existing = await db('inventory')
            .where({ product_id: id, location_id })
            .first();

        if (existing) {
            await db('inventory')
                .where({ product_id: id, location_id })
                .update({ min_quantity, updated_at: db.fn.now() });
        } else {
            await db('inventory').insert({
                product_id: id,
                location_id,
                quantity: 0, // Default to 0 for new records
                min_quantity
            });
        }

        res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});

// POST /api/products/:id/adjust-stock - Adjust stock for multiple locations (Admin/Manager)
router.post('/:id/adjust-stock', authenticateToken, async (req, res) => {
    // Check role
    if (!['Admin', 'InventoryManager'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const adjustments = req.body; // Array of { location_id, quantity }

    if (!Array.isArray(adjustments)) {
        return res.status(400).json({ error: 'Invalid data format. Expected array of adjustments.' });
    }

    try {
        await db.transaction(async (trx) => {
            for (const adj of adjustments) {
                const { location_id, quantity } = adj;

                // Check if record exists
                const existing = await trx('inventory')
                    .where({ product_id: id, location_id })
                    .first();

                if (existing) {
                    await trx('inventory')
                        .where({ product_id: id, location_id })
                        .update({ quantity, updated_at: trx.fn.now() });
                } else {
                    await trx('inventory').insert({
                        product_id: id,
                        location_id,
                        quantity,
                        min_quantity: 0
                    });
                }
            }
        });

        res.json({ message: 'Stock adjusted successfully' });
    } catch (error) {
        console.error('Error adjusting stock:', error);
        res.status(500).json({ error: 'Failed to adjust stock' });
    }
});

module.exports = router;
