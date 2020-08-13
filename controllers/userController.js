const User = require('./../models/userModel');
const Tag = require('./../models/tagModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  let allowedFields = ['name', 'identificationNumber', 'phone', 'location'];

  if (req.user.userType === 'applicant') {
    allowedFields.push('category', 'tags');

    const tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-_id -__v');
    req.body.tags = tags;
  }

  //Filter out unwanted fields names that are not allowed to be updated
  let filteredBody = filterObj(req.body, allowedFields);

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
