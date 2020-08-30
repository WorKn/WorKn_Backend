const Category = require('./../models/categoryModel');
const factory = require('./handlerFactory');

exports.getAllCategories = factory.getAll(Category);