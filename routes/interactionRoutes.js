const express = require('express');
const { restricTo, protect, verifyEmailValidation } = require('../controllers/authController');
const {
  createInteraction,
  getMyInteractions,
  protectOfferInteraction,
  acceptInteraction,
  cancelInteraction,
  rejectInteraction,
  validateCreateInteraction,
  validateAcceptInteraction,
} = require('../controllers/interactionController');
const router = express.Router();

//Protected routes
router.use(protect, verifyEmailValidation);

router.patch('/accept/:id', validateAcceptInteraction, acceptInteraction);
router.patch('/reject/:id', rejectInteraction);
router.delete('/:id', cancelInteraction);

router.use(protectOfferInteraction);

router.post('/', validateCreateInteraction, createInteraction);
router.get('/me', getMyInteractions);

module.exports = router;
