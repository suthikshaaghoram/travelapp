const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, verifyRole(['admin']), adminController.getStats);
router.get('/users', verifyToken, verifyRole(['admin']), adminController.getUsers);
router.delete('/users/:id', verifyToken, verifyRole(['admin']), adminController.deleteUser);

// Alert Routes
router.post('/alert', verifyToken, verifyRole(['admin']), adminController.createAlert);
router.get('/alerts', verifyToken, adminController.getAlerts); // Public/Protected read access

module.exports = router;
