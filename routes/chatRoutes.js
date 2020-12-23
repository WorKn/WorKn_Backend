const express = require('express');
const {
  createChat,
  validateInteraction,
  protectChat,
  createMessage,
  getChatMessages,
  getMyChats,
  closeChat,
} = require('../controllers/chatController');
const { protect, verifyEmailValidation } = require('./../controllers/authController');
const router = express.Router();

router.use(protect);

router.route('/').post(validateInteraction, createChat).get(getMyChats);

router.route('/:id/close').patch(protectChat, closeChat);

router
  .route('/:id/messages')
  .post(protectChat, createMessage)
  .get(protectChat, getChatMessages);

module.exports = router;
