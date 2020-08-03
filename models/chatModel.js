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
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El chat debe poseer un emisor.'],
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El chat debe poseer un receptor.'],
  },
  isLive: {
    type: Boolean,
    default: false,
  },
  isDenied: Boolean,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
