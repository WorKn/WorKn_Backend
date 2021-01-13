const Category = require('./../models/categoryModel');
const factory = require('./handlerFactory');
const Tag = require('../models/tagModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllCategories = factory.getAll(Category);

exports.getCategoriesTag = catchAsync(async (req, res, next) => {
  var targetCategory = await Category.findById(req.params.categoryId);
  if (!targetCategory) {
    return next(
      new AppError('Lo sentimos, la categoría solicitada no existe por el momento.', 400)
    );
  }

  var tags = await Tag.find({ category: targetCategory });
  res.status(200).json({
    status: 'success',
    data: {
      tags: tags,
    },
  });
});

exports.createCategory = factory.createOne(Category);
