const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyRole(['traveler']), tripController.createTrip);
router.get('/', verifyToken, verifyRole(['traveler']), tripController.getTrips);

module.exports = router;
