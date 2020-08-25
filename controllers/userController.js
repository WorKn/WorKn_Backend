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

  //If applicant has a category and tags, delete isSignupCompleted atribute
  if (updatedUser.tags && updatedUser.category) {
    updatedUser.isSignupCompleted = undefined;
  }

  updatedUser.save({ validateBeforeSave: false });

  //Create the new TagUser records asynchronously
  // if (req.user.userType === 'applicant' && req.user.tags) updateTagUser(req.user.id, tagsRef);
  if (req.user.userType === 'applicant' && tagsRef) updateTags(req.user, tagsRef);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
//TODO: Export this functions to a separate module and use it in Offers controller
const updateTags = async (user, tags) => {
  let userTags = [];
  if (user.tags) {
    user.tags.forEach((tag) => userTags.push(tag.id));
  }

  const currentTags = new Set(userTags);
  const newTags = new Set(tags);

  const tagsToBeAdded = difference(newTags, currentTags);
  const tagsToBeDeleted = difference(currentTags, newTags);

  addTagUser(user.id, tagsToBeAdded);
  deleteTagUser(user.id, tagsToBeDeleted);
};

const difference = (a, b) => {
  return new Set([...a].filter((x) => !b.has(x)));
};

const addTagUser = async (user, tags) => {
  tags.forEach((tag) => {
    TagUser.create({ tag, user }).catch((err) => {
      //Error code 11000 = Duplicate key
      if (err.code != 11000) console.log(err);
      // else if (!err) console.log('SUCCESS: tag(', tag, ') created');
    });
  });
};

const deleteTagUser = async (user, tags) => {
  tags.forEach((tag) => {
    TagUser.deleteOne({ tag, user }).catch((err) => {
      if (err) {
        console.log('ERROR:\n', err);
      }
      // else {
      //   console.log('SUCCESS: tag(', tag, ') deleted');
      // }
    });
  });
};

const updateTagUser = async (user, tags) => {
  tags.forEach((tag) => {
    TagUser.create({ tag, user }).catch((err) => {
      //Error code 11000 = Duplicate key
      if (err.code != 11000) console.log(err);
    });
  });
};
