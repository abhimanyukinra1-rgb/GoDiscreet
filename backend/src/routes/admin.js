const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Admin routes - add authentication for admin only
router.get('/users', authMiddleware, adminController.getUsers);
router.get('/reports', authMiddleware, adminController.getReports);
router.post('/reports/:id/action', authMiddleware, adminController.takeAction);

module.exports = router;
