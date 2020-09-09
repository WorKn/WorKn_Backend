const express = require('express');
const { restricTo, protect, verifyEmailValidation } = require('../controllers/authController');
const {
  createInteraction,
  getMyInteractions,
  protectOfferInteraction,
  acceptInteraction,
} = require('../controllers/interactionController');
const router = express.Router();

//Protected routes
router.use(protect, verifyEmailValidation);

router.route('/').post(protectOfferInteraction, createInteraction);
router.patch('/accept', protectOfferInteraction, acceptInteraction)
router.route('/me').get(getMyInteractions);

module.exports = router;
