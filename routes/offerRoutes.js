const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
  deleteOffer,
} = require('../controllers/offerController');
const {
  restricTo,
  protect,
  verifyEmailValidation,
} = require('./../controllers/authController');
const { createInteraction } = require('./../controllers/interactionController');
const router = express.Router();

router.get('/', getAllOffers);

router.get('/:id', getOffer);

//Protected routes
router.use(protect, verifyEmailValidation);

router.route('/interaction').post(createInteraction);

router.use(restricTo('offerer'));

router.post('/', createOffer);

router.route('/:id').patch(protectOffer, editOffer).delete(protectOffer, deleteOffer);

module.exports = router;
