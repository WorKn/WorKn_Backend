const mongoose = require('mongoose');
// const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const offerSchema = mongoose.Schema({
  title: {
    type: String,
    maxlength: 300,
    required: [true, 'Por favor, proporcione un título a su oferta.'],
  },
  description: {
    type: String,
    validate: {
      validator: function (el) {
        return el.length < 5000;
      },
      message: `Por favor, ingrese una descripción que posea menos de 5000 caracteres.`,
    },
    required: [true, 'Por favor, proporcione una descripción a su oferta.'],
  },
  offerType: {
    type: String,
    enum: ['fixed', 'free'],
    required: [true, 'Una oferta debe ser de un tipo.'],
  },
  state: {
    type: String,
    enum: ['active', 'paused', 'deleted'],
    default: 'active',
  },
  // location: locationSchema,
  location: {
    type: String,
    maxlength: 3000,
  },
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
    required: [true, 'Por favor, seleccione los tags de su oferta.'],
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
    select: false,
  },
  closingDate: {
    type: Date,
    validate: {
      validator: function (el) {
        return el > Date.now();
      },
      message: 'Por favor, elija una fecha futura como fecha de cierre.',
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

offerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
