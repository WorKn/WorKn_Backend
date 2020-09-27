const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');
const updateTags = require('./../utils/updateTags');

const User = require('./../models/userModel');
const Tag = require('./../models/tagModel');
const TagUser = require('./../models/tagUserModel');

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  let allowedFields = [
    'name',
    'lastname',
    'bio',
    'identificationNumber',
    'phone',
    'location',
    'profilePicture',
  ];
  const tagsRef = req.body.tags;

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('No puede cambiar su contraseña por esta vía.', 400));
  }

  if (req.user.userType === 'applicant') {
    allowedFields.push('category', 'tags');

    //Update tag's ref with their values
    if (req.body.tags) {
      req.body.tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-__v');
    }
  }

  //Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, allowedFields);

  // Update user document
  let updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  updatedUser.save({ validateBeforeSave: false });

  //Update TagUser records asynchronously
  if (req.user.userType === 'applicant' && tagsRef) updateTags(req.user, tagsRef, TagUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
