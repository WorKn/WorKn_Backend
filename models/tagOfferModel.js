const mongoose = require('mongoose');

const tagOfferSchema = mongoose.Schema({
  tag: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tag',
    required: [true, 'Debe de estar asociado a un tag.'],
    index: true,
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer',
    required: [true, 'Debe de estar asociado a una oferta.'],
    index: true,
  },
});

tagOfferSchema.index({ tag: 1, offer: 1 }, { unique: true });

const tagOffer = mongoose.model('TagOffer', tagOfferSchema);

module.exports = tagOffer;
