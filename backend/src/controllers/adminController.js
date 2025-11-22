const db = require('../db/knex');

// List all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db('users').select('id', 'login_id', 'email', 'role', 'created_at');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['Admin', 'InventoryManager', 'WarehouseStaff'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role provided' });
    }

    try {
        const updatedUser = await db('users')
            .where({ id })
            .update({ role })
            .returning(['id', 'login_id', 'role']);

        if (updatedUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', user: updatedUser[0] });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};
