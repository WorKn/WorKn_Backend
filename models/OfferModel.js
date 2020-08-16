const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const offerSchema = mongoose.Schema({
  title: {
    type: String,
    maxlength: 300,
    required: [true, 'Por favor, proporcione un título a su oferta.'],
  },
  description: {
    type: String,
    maxlength: 3000,
    required: [true, 'Por favor, proporcione una descripción a su oferta.'],
  },
  offerType: {
    type: String,
    enum: ['temporal', 'undefined', 'contract', 'free'],
    required: [true, 'Una oferta debe ser de un tipo.'],
  },
  state: {
    type: String,
    enum: ['active', 'paused', 'deleted'],
    default: 'active',
  },

  location: locationSchema,

  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Una oferta no puede existir sin un dueño.'],
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
  },

  tags: {
    type: [tagSchema],
    validate: [
      {
        validator: function (el) {
          return el.length < 11;
        },
        message: 'La cantidad máxima de tags que se puede seleccionar es 10.',
      },
      {
        validator: function (el) {
          return el.length > 2;
        },
        message: 'La cantidad mínima de tags que se puede seleccionar es 3.',
      },
    ],
  },

  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Una oferta debe poseer una categoria.'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  closingDate: {
    type: Date,
    validate: {
      validator: function (el) {
        return el.closingDate > el.createdAt;
      },
      message: 'Una oferta no puede cerrar antes de ser creada.',
    },
  },
  salaryRange: {
    type: [Number],
    default: void 0,
    validate: [
      {
        validator: function (arr) {
          return arr.every((n) => n > 0);
        },
        message: 'Un salario no puede ser menor a 0.',
      },
      {
        validator: function (arr) {
          return arr.length < 3;
        },
        message:
          'Un salario debe estar contenido en un rango, o en su defecto, un monto fijo.',
      },
    ],
  },
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
