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
        require: [true,'Por favornpm, díganos que busca en su oferta']
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
        default: 'active'
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
    
    tag: tagSchema,

    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, "Una oferta debe poseer una categoria" ] 
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        required: [true, "Una oferta debe de contener la fecha en que se modificó."],
        default: Date.now()
    }, 
    closingDate: {
        type: Date,
        validate:{
            validator: function(el){
                return el.closingDate > el.createdAt;
            },
            message: 'Una oferta no puede cerrar antes de ser creada'
        }
    },
    salaryRange:{
        type: [Number],
        validate: {
            validator: function(arr){
                return arr.every((n) => n > 0)
            },
            message: 'Un salario no puede ser menor a 0'
        }
    }
})