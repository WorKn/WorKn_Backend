const Tag = require('../models/tagModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Category = require('./../models/categoryModel');

exports.createTag = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return next(
      new AppError('Lo sentimos, la categoría solicitada no existe por el momento.', 400)
    );
  }

  const tag = await Tag.create({
    name: req.body.name,
    category,
  });

  res.status(201).json({
    status: 'success',
    data: {
      tag,
    },
  });
});
