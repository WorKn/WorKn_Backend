const mongoose = require('mongoose');
const categorySchema = require('../schemas/sharedCategorySchema');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    lowercase: true,
    unique: true,
  },
  category: {
    type: categorySchema,
    _id: false,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
