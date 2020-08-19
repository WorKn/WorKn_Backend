const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
} = require('../controllers/offerController');
const {
  restricTo,
  protect,
  verifyEmailValidation,
} = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOffers);
router.get('/:id', getOffer);

//Protected routes
router.use(protect, restricTo('offerer'), verifyEmailValidation);

router.post('/', createOffer);
router.post('/', protectOffer, editOffer);

module.exports = router;
