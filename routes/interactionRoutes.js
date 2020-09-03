const express = require('express');
const { createInteraction } = require('./../controllers/interactionController');
const { protect } = require('./../controllers/authController');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .post(createInteraction);


module.exports = router;