const mongoose = require('mongoose');

const tagOfferSchema = mongoose.Schema({
    tag:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag',
        required: [true,"Debe de estar asociado a un tag."]
    },
    offer:{
        type: mongoose.Schema.ObjectId,
        ref: 'Offer',
        required: [true,"Debe de estar asociado a una oferta."]
    }
})

const tagOffer = mongoose.model('TagOffer',tagOfferSchema);

module.exports = tagOffer;