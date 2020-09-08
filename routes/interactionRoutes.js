const express = require('express');
const { restricTo, protect, verifyEmailValidation } = require('../controllers/authController');
const {
  createInteraction,
  getMyInteractions,
  protectOfferInteraction,
} = require('../controllers/interactionController');
const router = express.Router();

//Protected routes
router.use(protect, verifyEmailValidation);

router.route('/').post(protectOfferInteraction, createInteraction);

router.route('/me').get(protectOfferInteraction, getMyInteractions);

module.exports = router;
