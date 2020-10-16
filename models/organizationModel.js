const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('../schemas/locationSchema');
const { isOrgRegisteredInDGII } = require('./../utils/dgiiCrawler');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, provea el nombre de la organización.'],
  },
  RNC: {
    type: String,
    validate: [
      {
        validator: validator.isNumeric,
        message: 'El RNC debe poseer solo caracteres numéricos.',
      },
      {
        validator: function (el) {
          return el.length == 9 || el.length == 11;
        },
        message: 'El RNC debe poseer 9 u 11 dígitos.',
      },
    ],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  location: locationSchema,
  phone: {
    type: String,
    validate: [
      validator.isNumeric,
      'El número telefónico debe poseer solo caracteres numéricos.',
    ],
  },
  email: {
    type: String,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor, ingrese un correo electrónico válido.'],
  },
  members: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    required: true,
    select: false,
    validate: {
      validator: function (el) {
        return el.length > 0;
      },
      message: 'Una organización debe poseer al menos un usuario.',
    },
  },
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
  hasLicense: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    maxlength: 3000,
  },
  profilePicture: {
    type: String,
    default:
      'https://res.cloudinary.com/workn/image/upload/v1599076826/resources/blank-profile-picture_lvbhnr.png',
  },
});

organizationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

organizationSchema.methods.verifyRNCWithDGII = function () {
  console.log('Verifying RNC: ', this.RNC);
  isOrgRegisteredInDGII(this.RNC).then((isVerified) => {
    console.log(`Verification result of RNC ${this.RNC}: `, isVerified);
    this.isVerified = isVerified;
    this.save();
  });
};

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
