const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, provea su nombre.'],
  },
  identificationNumber: {
    type: String,
    validate: [
      {
        validator: validator.isNumeric,
        message: 'El número de identificación debe poseer solo caracteres numéricos.',
      },
      {
        validator: function (el) {
          return el.length == 11;
        },
        message: 'El número de identificación debe poseer 11 dígitos.',
      },
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
  birthday: {
    type: Date,
    max: function () {
      let maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 16);
      return maxDate;
    },
    required: [true, 'Por favor, ingrese su fecha de nacimiento.'],
  },
  chats: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat',
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [
      function () {
        return this.userType == 'applicant';
      },
      'Por favor, seleccione una categoría de interés.',
    ],
  },
  location: locationSchema,
  password: {
    type: String,
    required: [true, 'Por favor, provea una contraseña.'],
    minlength: [8, 'Las contraseñas deben poseer como mínimos 8 caracteres.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Por favor, confirme su contraseña.'],
    validate: {
      //This only works on Create() and Save()
      validator: function (el) {
        return el == this.password;
      },
      message: 'Las contraseñas no son iguales.',
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
    default: Date.now(),
    select: false,
  },
  userType: {
    type: String,
    enum: ['offerer', 'applicant', 'admin'],
    required: [true, 'Se requiere el tipo de usuario.'],
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
    type: [tagSchema],
    //This is for preventing mongoose to create an empty array by default.
    default: void 0,
    required: [
      function () {
        return this.userType == 'applicant';
      },
      'Por favor, seleccione tags de interés.',
    ],
    validate: {
      validator: function (el) {
        return el.length < 11;
      },
      message: 'Límite de tags (10) excedido.',
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
