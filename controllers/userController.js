const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');

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
  let allowedFields = ['name', 'lastname', 'bio', 'identificationNumber', 'phone', 'location'];
  const tagsRef = req.body.tags;

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('No puede cambiar su contraseña por esta vía.', 400));
  }

  if (req.user.userType === 'applicant') {
    allowedFields.push('category', 'tags');

    //Update tag's ref with their values
    req.body.tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-_id -__v');
  }

  //Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, allowedFields);

  // Update user document
  let updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  //If applicant has a category and tags, delete isSignupCompleted atribute
  if (updatedUser.tags && updatedUser.category) {
    updatedUser.isSignupCompleted = undefined;
  }

  updatedUser.save({ validateBeforeSave: false });

  //Create the new TagUser records asynchronously
  if (req.user.userType === 'applicant') updateTagUser(req.user.id, tagsRef);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const updateTagUser = async (user, tags) => {
  tags.forEach((tag) => {
    TagUser.create({ tag, user }).catch((err) => {
      //Error code 11000 = Duplicate key
      if (err.code != 11000) console.log(err);
    });
  });
};
