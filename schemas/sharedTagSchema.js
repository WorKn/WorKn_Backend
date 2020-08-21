const mongoose = require('mongoose');
const categorySchema = require('./sharedCategorySchema');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    lowercase: true,
  },
  category: categorySchema,
  _id: false,
});

module.exports = tagSchema;
