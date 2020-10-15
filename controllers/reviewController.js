const Review = require('./../models/reviewModel');
const User = require('./../models/userModel');
const Interaction = require('./../models/InteractionModel');

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

  if (userReviewed.userType === req.user.userType) {
    return next(new AppError('No puede hacer un review a un usuario de su mismo tipo.', 400));
  }

  if (userReviewed.organization) {
    return next(new AppError('No puede hacer review de una organización.', 403));
  }

  let interactions = [];

  if (req.user.userType == 'offerer') {
    interactions = Interaction.find({
      state: 'match',
      applicant: userReviewed.id,
      offerer: req.user.id,
    });
  } else if (req.user.userType == 'applicant') {
    interactions = Interaction.find({
      state: 'match',
      offerer: userReviewed.id,
      applicant: req.user.id,
    });
  }

  interactions = await interactions.populate({
    path: 'offer',
    match: { offerType: 'free' },
  });

  if (interactions.length == 0 || areAllOffersNull(interactions)) {
    return next(
      new AppError(
        'No reune las condiciones necesarias para crear un review al usuario indicado.',
        403
      )
    );
  }

  next();
});

const areAllOffersNull = (interactions) => {
  let output = true;
  interactions.forEach((interaction) => {
    if (interaction.offer) output = false;
  });

  return output;
};

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
