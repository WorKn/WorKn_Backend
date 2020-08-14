const mongoose = require('mongoose');

const tagUserSchema = mongoose.Schema({
  tag: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tag',
    required: [true, 'Debe de estar asociado a un tag'],
    index: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Debe de estar asociado a un usuario'],
    index: true,
  },
});

tagUserSchema.index({ tag: 1, user: 1 }, { unique: true });

const tagUser = mongoose.model('TagUser', tagUserSchema);

module.exports = tagUser;
