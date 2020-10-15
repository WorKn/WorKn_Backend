const Review = require('./../models/reviewModel');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');

exports.protectReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (review && review.createdBy != req.user.id) {
    return next(new AppError('No tiene permisos para modificar este review.', 403));
  }

  next();
});

exports.validateCreateReview = catchAsync(async (req, res, next) => {
  const userReviewed = await User.findById(req.params.userId);

  if (!userReviewed) {
    return next(new AppError('Usuario no encontrado.', 404));
  }

  next();
});

exports.setUsersIds = (req, res, next) => {
  req.body.userReviewed = req.params.userId;
  req.body.createdBy = req.user.id;

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
