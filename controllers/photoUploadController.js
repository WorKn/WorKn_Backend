const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

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

exports.uploadPhotoToCloudinary = (entity) => {
  return catchAsync(async (req, res, next) => {
    if (req.file) {
      let folderPath = '';

      if (entity == 'User') {
        folderPath = `users/${req.user.id}/`;
      } else if (entity == 'Organization') {
        folderPath = `organizations/${req.user.organization}/`;
      } else {
        return next(new AppError('Error', 500));
      }
      const result = await streamUpload(req, folderPath);

      if (result.secure_url) {
        req.body.profilePicture = result.secure_url;
      }
    }

    next();
  });
};

let streamUpload = (req, folderPath) => {
  return new Promise((resolve, reject) => {
    const config = {
      folder: folderPath,
      tags: ['Profile Picture'],
    };

    let stream = cloudinary.uploader.upload_stream(config, (error, result) => {
      if (result) {
        console.log('SUCCESS: Image uploaded successfully to ' + folderPath);
        resolve(result);
      } else {
        console.log('ERROR:', 'On image upload.\n', error);
        reject(error);
      }
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
