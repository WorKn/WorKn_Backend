const mongoose = require('mongoose');

const tagUserSchema = mongoose.Schema({
    tag:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag',
        required: [true,"Debe de estar asociado a un tag"]
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,"Debe de estar asociado a un usuario"]
    }
})

const tagUser = mongoose.model('TagUser',tagUserSchema);

module.exports = tagUser;