const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');
const updateTags = require('./../utils/updateTags');

const User = require('./../models/userModel');
const Tag = require('./../models/tagModel');
const TagUser = require('./../models/tagUserModel');
const TagOffer = require('./../models/tagOfferModel');
const Offer = require('../models/offerModel');


exports.getAllUsers = factory.getAll(User);

const getUsersWithTags = async (req,res) =>{
  tags = await TagUser.find({ tag: { $in: req.query.tags } })
    .populate({
      path: 'user',
      select: '-__v -isEmailValidated',
      populate: [
        { path: 'tags', select: '-__v' },
      ],
    })
  .select('-__v')

  const users = new Set();

  tags.forEach(async (tagUser) => {
    users.add(tagUser.user);
  });
  res.status(200).json({
    status: 'success',
    results: users.size,
    data: {
      users: Array.from(users),
    },
  });
};

exports.getUser = factory.getOne(User);

exports.getUsersHandler = catchAsync(async(req,res,next)=>{
  req.query.tags? getUsersWithTags(req,res) : this.getAllUsers(req,res,next);
});

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

exports.getUserRecommendation = catchAsync(async (req, res, next) => {
  const fieldsToShow = '_id name email profilePicture';
  tags = await TagOffer.find({ tag: { $in: req.user.tags } }).populate({
    path: 'offer',
    select: '-__v',
    populate: [
      { path: 'category', select: '-__v' },
      { path: 'organization', select: fieldsToShow + ' phone' },
      {
        path: 'createdBy',
        select: fieldsToShow,
      },
    ],
  })
  .select('-__v');
  recommended = new Set();
  while (recommended.size != 20 && tags.length > 0) {
    position = Math.floor(Math.random() * tags.length) + 0;
    console.log(tags[position].offer)
    recommended.add(tags[position].offer);
    tags.splice(position, 1);
  }
  recommended = Array.from(recommended);
  res.status(200).json({
    status: 'success',
    results: recommended.length,
    data: {
      recommended,
    },
  });
});