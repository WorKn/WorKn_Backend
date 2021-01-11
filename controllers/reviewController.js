const Review = require('./../models/reviewModel');
const User = require('./../models/userModel');
const Interaction = require('./../models/InteractionModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');

exports.protectReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (review && review.createdBy.id != req.user.id) {
    return next(new AppError('No tiene permisos para modificar este review.', 403));
  }

  next();
});

exports.validateCreateReview = catchAsync(async (req, res, next) => {
  const userToBeReviewed = await User.findById(req.params.userId);

  if (!userToBeReviewed) {
    return next(new AppError('Usuario no encontrado.', 404));
  }

  if (userToBeReviewed.userType === req.user.userType) {
    return next(new AppError('No puede hacer un review a un usuario de su mismo tipo.', 400));
  }

  if (userToBeReviewed.organization) {
    return next(new AppError('No puede hacer review de una organización.', 403));
  }

  const interactions = await getMatchedInteractions(userToBeReviewed, req.user);

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

exports.setUsersIds = (req, res, next) => {
  req.body.userReviewed = req.params.userId;
  req.body.createdBy = req.user.id;

  next();
};

exports.getReviewValidation = catchAsync(async (req, res, next) => {
  let userCanBeReviewed = true;
  const userToBeReviewed = await User.findById(req.params.userId);

  if (
    !userToBeReviewed ||
    userToBeReviewed.userType === req.user.userType ||
    userToBeReviewed.organization
  ) {
    userCanBeReviewed = false;
  }

  const interactions = await getMatchedInteractions(userToBeReviewed, req.user);

  if (interactions.length == 0 || areAllOffersNull(interactions)) {
    userCanBeReviewed = false;
  }

  res.status(200).json({
    status: 'success',
    data: {
      userCanBeReviewed,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ userReviewed: req.params.userId });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

const getMatchedInteractions = async (userToBeReviewed, currentUser) => {
  let interactions = [];

  if (currentUser.userType == 'offerer') {
    interactions = Interaction.find({
      state: 'match',
      applicant: userToBeReviewed.id,
      offerer: currentUser.id,
    });
  } else if (currentUser.userType == 'applicant') {
    interactions = Interaction.find({
      state: 'match',
      offerer: userToBeReviewed.id,
      applicant: currentUser.id,
    });
  }

  interactions = await interactions.populate({
    path: 'offer',
    match: { offerType: 'free' },
  });

  return interactions;
};

const areAllOffersNull = (interactions) => {
  let output = true;
  interactions.forEach((interaction) => {
    if (interaction.offer) output = false;
  });

  return output;
};

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
