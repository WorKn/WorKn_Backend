const mongoose = require('mongoose');
const categorySchema = require('./categorySchema');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    lowercase: true,
    unique: true,
  },
  category: categorySchema,
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
