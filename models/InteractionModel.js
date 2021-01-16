const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['applied', 'interested', 'match', 'deleted'],
    required: [true, 'Una interación debe poseer un estado.'],
  },
  rejected: {
    type: Boolean,
  },
  isOfferClosed: {
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
  offerer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Una interación debe estar vinculada a un aplicante.'],
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer',
    required: [true, 'Una interación debe estar vinculada a una oferta.'],
  },
});

const interaction = mongoose.model('Interaction', interactionSchema);

module.exports = interaction;
