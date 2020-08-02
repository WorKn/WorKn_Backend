const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    require: true,
    lowercase: true,
  },
});

module.exports = tagSchema;
