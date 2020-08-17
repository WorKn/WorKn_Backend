const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
} = require('../controllers/offerController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(getAllOffers).post(protect, restricTo('offerer'), createOffer);
router.route('/:id').get(getOffer).patch(protect, restricTo('offerer'), editOffer);

module.exports = router;
