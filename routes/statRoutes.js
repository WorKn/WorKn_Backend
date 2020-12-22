const express = require('express');

const { getLandingPageStats } = require('../controllers/statController');
const router = express.Router();

router.get('/landingpage', getLandingPageStats);

module.exports = router;
