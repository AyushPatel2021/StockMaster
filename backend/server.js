const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await db('users').insert({
                login_id: 'admin001',
                email: 'admin@example.com',
                password_hash: hashedPassword,
                role: 'Admin'
            });
            console.log('Default Admin created: admin001 / Admin@123');
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
    console.log(`Server running on port ${PORT}`);
});
