const mongoose = require('mongoose');
const categorySchema = require('./../schemas/categorySchema');

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
