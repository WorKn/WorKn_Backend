const mongoose = require('mongoose');
const validator = require('validator');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    maxlength: 3000,
    required: [true, 'Por favor, ingrese un mensaje.'],
    validate: {
      validator: function (el) {
        return !validator.isEmpty(el, { ignore_whitespace: true });
      },
      message: 'El mensaje no puede estar vacío.',
    },
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El mensaje debe poseer un emisor.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
