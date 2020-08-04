const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  messages: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
      },
    ],
  },
  user1: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El chat debe estar vinculado a dos usuarios.'],
  },
  user2: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El chat debe estar vinculado a dos usuarios.'],
  },
  isLive: {
    type: Boolean,
    default: false,
  },
  isDenied: Boolean,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
