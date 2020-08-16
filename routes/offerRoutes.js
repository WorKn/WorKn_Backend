const express = require('express');
const { createOffer, getAllOffers, getOffer } = require('../controllers/offerController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.post('/createOffer', protect, restricTo('offerer'), createOffer);

router.get('/', getAllOffers);
router.get('/:id', getOffer);

module.exports = router;
