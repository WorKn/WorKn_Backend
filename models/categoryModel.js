const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
