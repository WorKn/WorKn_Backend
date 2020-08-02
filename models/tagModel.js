const mongoose = require('mongoose');
const tagSchema = require('./../schemas/tagSchema');

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
