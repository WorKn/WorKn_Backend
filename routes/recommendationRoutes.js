const express = require('express');

const {
  getOfferRecommendation,
  getUserRecommendation,
} = require('./../controllers/recommendationController');
const { restricTo, protect } = require('./../controllers/authController');
const router = express.Router();

router.get('/user', protect, getUserRecommendation);
router.get('/offer',protect, getOfferRecommendation);

module.exports = router;
