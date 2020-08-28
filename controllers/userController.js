const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('./../utils/filterObj');
const updateTags = require('./../utils/updateTags');

const User = require('./../models/userModel');
const Tag = require('./../models/tagModel');
const TagUser = require('./../models/tagUserModel');

const multerStorage = multer.memoryStorage();

//Only allow images to be uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Archivo inválido. Solo se permiten imágenes.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadPhotoToServer = upload.single('profilePicture');

exports.uploadPhotoToCloudinary = catchAsync(async (req, res, next) => {
  const result = await streamUpload(req);

  if (result.secure_url) {
    req.user.profilePicture = result.secure_url;
  }

  next();
});

let streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const config = {
      folder: `users/${req.user.email}/`,
      tags: ['Profile Picture'],
    };

    let stream = cloudinary.uploader.upload_stream(config, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        console.log(error);
        reject(error);
      }
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

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

  //If applicant has a category and tags, delete isSignupCompleted atribute
  if (updatedUser.tags && updatedUser.category) {
    updatedUser.isSignupCompleted = undefined;
  }

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
