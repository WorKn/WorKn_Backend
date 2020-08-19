const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
  deleteOffer,
} = require('../controllers/offerController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(getAllOffers).post(protect, restricTo('offerer'), createOffer);
router
  .route('/:id')
  .get(getOffer)
  .patch(protect, restricTo('offerer'), protectOffer, editOffer)
  .delete(protect, restricTo('offerer'), protectOffer, deleteOffer);

module.exports = router;
