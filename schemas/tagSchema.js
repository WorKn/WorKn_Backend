const mongoose = require('mongoose');
const categorySchema = require('./categorySchema');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  category: categorySchema,
});

module.exports = tagSchema;
