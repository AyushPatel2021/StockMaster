
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const warehouseRoutes = require('./src/routes/warehouseRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const receiptRoutes = require('./src/routes/receiptRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const transferRoutes = require('./src/routes/transferRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('StockMaster API is running');
});

const db = require('./src/db/knex');
const bcrypt = require('bcrypt');

// Seed Admin User
const seedAdmin = async () => {
    try {
        const adminExists = await db('users').where({ role: 'Admin' }).first();
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await db('users').insert({
                login_id: 'admin',
                email: 'admin@example.com',
                password_hash: hashedPassword,
                role: 'Admin'
            });
            console.log('Default Admin created: admin / admin');
        } else {
            console.log('Admin already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// Start Server
app.listen(PORT, async () => {
    await seedAdmin();
    console.log(`Server running on port ${PORT} `);
});
