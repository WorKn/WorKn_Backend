const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    lowercase: true,
  },
  _id: false,
});

module.exports = categorySchema;
