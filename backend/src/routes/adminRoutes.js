const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all users (Admin only)
router.get('/users', authMiddleware, roleMiddleware(['Admin']), adminController.getAllUsers);

// Update user role (Admin only)
router.put('/users/:id/role', authMiddleware, roleMiddleware(['Admin']), adminController.updateUserRole);

module.exports = router;
