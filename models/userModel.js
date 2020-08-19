const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, provea su nombre.'],
  },
  lastname: {
    type: String,
    required: [true, 'Por favor, provea su apellido.'],
  },
  bio: {
    type: String,
    maxlength: 3000,
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
        return el === this.password;
      },
      message: 'Las contraseñas no son iguales.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isSignupCompleted: {
    type: Boolean,
    default: function () {
      if (this.userType == 'applicant') return false;
      else undefined;
    },
  },
  isEmailValidated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
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
    validate: {
      validator: function (el) {
        return el.length < 11;
      },
      message: 'La cantidad máxima de tags que se puede seleccionar es 10.',
    },
    validate: {
      validator: function (el) {
        return el.length > 2;
      },
      message: 'La cantidad mínima de tags que se puede seleccionar es 3.',
    },
  },
});

userSchema.pre('save', async function (next) {
  //If password have not been modified, do not execute this function
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

//When the user modify its password and its not new, we want to update the passwordChangedAt field
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Substracting 1 second will ensure that the token be created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.verifyPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  //Creating reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //Store the encrypted reset token in the user document
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  //Converting to miliseconds. Reset token will expire in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //Send unencrypted reset token to user
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //Convert date to miliseconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
