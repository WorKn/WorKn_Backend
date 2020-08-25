const mongoose = require('mongoose');
const categorySchema = require('./sharedCategorySchema');

const tagSchema = mongoose.Schema({
  _id: mongoose.Schema.ObjectId,
  name: {
    type: String,
    require: true,
    lowercase: true,
  },
  category: categorySchema,
});

module.exports = tagSchema;
