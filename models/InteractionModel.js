const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    state: {
      type: String,
      enum: ['applied','interesed','match'],
      required: [true, 'Una interación debe estar en un estado.'],
      default: 'applied'
    },
    rejected: {
      type: Boolean
    },
    createdAt: {
        type: Date,
        required: [true, "Una interación debe de contener la fecha de creación."],
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: [true, "Una interación debe de contener la fecha en que se modificó."],
        default: Date.now
    },         
    offerer:{ 
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
    },
    applicant: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "En una interación debe existir un aplicante." ] 
    },
    Offer: { 
        type: mongoose.Schema.ObjectId,
        ref: 'Offer',
        required: [true, "Una interación debe estar vinculada a una oferta." ] 
    }
});

const interaction = mongoose.model('Interaction', userSchema);

module.exports = interaction;