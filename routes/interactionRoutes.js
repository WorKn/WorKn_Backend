const express = require('express');
const { restricTo, protect, verifyEmailValidation } = require('../controllers/authController');
const {
  createInteraction,
  getMyInteractions,
  protectOfferInteraction,
  acceptInteraction,
  cancelInteraction,
} = require('../controllers/interactionController');
const router = express.Router();
router.patch('/accept/:id', protect, acceptInteraction);
router.delete('/:id',protect,verifyEmailValidation, cancelInteraction)

//Protected routes
router.use(protect, verifyEmailValidation, protectOfferInteraction);

router.post('/', createInteraction);
router.get('/me', getMyInteractions);

module.exports = router;
