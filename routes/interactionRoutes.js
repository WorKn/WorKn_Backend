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
router.use(protect, verifyEmailValidation, protectOfferInteraction);

router.post('/', createInteraction);
router.patch('/accept', acceptInteraction);
router.get('/me', getMyInteractions);

module.exports = router;
