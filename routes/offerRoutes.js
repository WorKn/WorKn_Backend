const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
} = require('../controllers/offerController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(getAllOffers).post(protect, restricTo('offerer'), createOffer);
router
  .route('/:id')
  .get(getOffer)
  .patch(protect, restricTo('offerer'), protectOffer, editOffer);

module.exports = router;
