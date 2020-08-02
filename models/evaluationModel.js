const mongoose = require('mongoose');
const validator = require('validator');

const evaluationSchema = new mongoose.Schema({
    evaluation: {
      type: Number,
      min: [0, "No puede ser menor a 0."],
      max: [5, "No puede ser mayor a 5."],
      required: [true, 'Por favor, provea una calificación.'],
      default: 4
    },
    review: {
      type: String,
      maxlength: 3000,
      validate: [validator.String, "Debe ser un texto."] 
    },       
    author:{ 
        type: mongoose.Schema.ObjectId, 
        ref: 'User',
        required: [true, "Debe provenir de un usuario." ] 
    },
    addressee: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Debe ir dirigido a un usuario." ] 
    }
});

const evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = evaluation;
