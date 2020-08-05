const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const offerSchema = mongoose.Schema({

    title:{
        type: String,
        maxlength: 300,
        require: [true,'Por favor, proporcione un título a su oferta']
    },
    description: {
        type: String,
        maxlength: 3000,
        require: [true,'Por favor, díganos que busca en su oferta']
    },
    offerType:{

        type: String,
        enum: ['temporal','undefined','contract','free'],
        required: [true, 'Una oferta debe ser de un tipo.'],
    },
    state:{
        type: String,
        enum: ['active','paused','deleted'],
        required: [true, 'Una oferta debe poseer un estado.'],
    },
    
    location: locationSchema,
    
    owner: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Una oferta no puede existir sin un dueño" ] 
    },
    organization: { 
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        validate: {
            // check if you're in a organization 
            validator: function (el) {
              return el.owner.organization != null;
            },
            message: 'Una oferta solo puede pertenecer a una organización si usted está en una.',
          },
    },
    
})