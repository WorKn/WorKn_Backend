const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const User = require('./../models/userModel');
const Tag = require('./../models/tagModel');
const TagUser = require('./../models/tagUserModel');

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

  let allowedFields = ['name', 'lastname', 'identificationNumber', 'phone', 'location'];

  if (req.user.userType === 'applicant') {
    allowedFields.push('category', 'tags');

    const tags = req.body.tags;
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
    updatedUser.save({ validateBeforeSave: false });
  }

  //Create the new TagUser records asynchronously
  updateTagUser(req.user.id, tags);

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
