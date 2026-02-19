const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Public/Traveler routes
router.get('/', verifyToken, resourceController.getResources);
router.get('/nearby', verifyToken, resourceController.getNearbyResources);

// Provider only routes
router.post('/', verifyToken, verifyRole(['provider']), resourceController.createResource);
router.put('/:id', verifyToken, verifyRole(['provider']), resourceController.updateResource);

// Provider and Admin routes
router.delete('/:id', verifyToken, verifyRole(['provider', 'admin']), resourceController.deleteResource);

module.exports = router;
