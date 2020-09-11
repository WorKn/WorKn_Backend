const express = require('express');
const { createChat, protectChat } = require('./../controllers/chatController2');
const {
  restricTo,
  protect,
  verifyEmailValidation,
} = require('./../controllers/authController');
const router = express.Router();

router.post('/', protect, protectChat, createChat);

module.exports = router;
