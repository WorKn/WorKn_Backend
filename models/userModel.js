const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, provea su nombre.'],
  },
  identificationNumber: {
    type: String,
    validate: [
      validator.isNumeric,
      'El número de identificación debe poseer solo caracteres numéricos.',
    ],
  },
  phone: {
    type: String,
    validate: [
      validator.isNumeric,
      'El número telefónico debe poseer solo caracteres numéricos.',
    ],
  },
  email: {
    type: String,
    required: [true, 'Por favor, provea su correo electrónico.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor, ingrese un correo electrónico válido.'],
  },
  birthday: Date,
  chats: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat',
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    //Add validator if userType is Applicant
  },
  location: {
    coordinates: [Number],
    address: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password must have min 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide confirm your password.'],
    validate: {
      //This only works on Create() and Save()
      validator: function (el) {
        return el == this.password;
      },
      message: 'Passwords does not match.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedAt: {
    type: Date,
    select: false,
  },
  userType: {
    type: String,
    enum: ['offerer', 'aplicant', 'admin'],
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
  },
  organizationRole: {
    type: String,
    enum: ['owner', 'admin', 'member'],
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  profilePicture: String,
  tags: {
    type: [
      {
        name: String,
        category: String,
      },
    ],
    validate: {
      validator: function (el) {
        return el.length <= 10;
      },
      message: 'Tag limit (10) exceeded.',
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
