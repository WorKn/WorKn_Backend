const mongoose = require('mongoose');

const tagUserSchema = mongoose.Schema({
    tag:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag',
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }
})

const tagUser = mongoose.model('TagUser',tagUserSchema);

module.exports = tagUser;