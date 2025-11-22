const bcrypt = require('bcrypt');
const db = require('./src/db/knex');

const resetPassword = async () => {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const count = await db('users')
            .where({ login_id: 'admin001' })
            .update({ password_hash: hashedPassword });

        if (count) {
            console.log('Password reset for admin001 to password123');
        } else {
            console.log('User admin001 not found. Creating user...');
            // Create user if not exists
            await db('users').insert({
                login_id: 'admin001',
                email: 'admin@stockmaster.com',
                password_hash: hashedPassword,
                role: 'Admin'
            });
            console.log('User admin001 created with password123');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        process.exit(0);
    }
};

resetPassword();
