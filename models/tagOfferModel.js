const mongoose = require('mongoose');

const tagUserSchema = mongoose.Schema({
    tag:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag',
        required: [true,"Debe de estar asociado a un tag"]
    },
    offer:{
        type: mongoose.Schema.ObjectId,
        ref: 'offer',
        required: [true,"Debe de estar asociado a una oferta"]
    }
})

const tagUser = mongoose.model('TagUser',tagUserSchema);

module.exports = tagUser;