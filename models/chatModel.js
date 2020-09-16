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
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
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

// chatSchema.virtual('lastMessage').get(async function () {
//   const lastMessageId = this.messages[this.messages.length - 1];
//   const message = await Message.findById(lastMessageId);
//   return message;
// });

//TODO: Retrieve last message on getMyChats
// chatSchema.virtual('populateLastMessage', {
//   ref: 'Message',
//   localField: 'lastMessage',
//   foreignField: '_id',
//   // justOne: true,
//   // options: { sort: { createdAt: -1 }, limit: 1 },
// });

chatSchema.pre('save', async function (next) {
  if (!this.isModified('messages')) return next();

  this.lastMessage = this.messages[this.messages.length - 1];

  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
