const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
});

module.exports = categorySchema;
