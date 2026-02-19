const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public or Protected? Let's keep them public for verification
router.get('/top-places', locationController.getTopPlaces);
router.get('/places', locationController.getPlaces);
router.get('/crowd', locationController.getCrowdData);
router.get('/destination-crowd', locationController.getDestinationCrowd);
router.get('/places/crowd-slots', locationController.getPlaceCrowdSlots);
router.post('/places/visit', locationController.recordPlaceVisit);
router.post('/visit', locationController.recordVisit);
router.get('/crowd/provider', locationController.getProviderCrowdStats);

module.exports = router;
