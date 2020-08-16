const express = require('express');
const { createOffer, getAllOffers, getOffer } = require('../controllers/offerController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(getAllOffers).post(protect, restricTo('offerer'), createOffer);

router.get('/:id', getOffer);

module.exports = router;
