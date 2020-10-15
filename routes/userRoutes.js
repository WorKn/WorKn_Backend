const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updateMyPassword,
  restricTo,
  logout,
  validateEmail,
} = require('./../controllers/authController');
const {
  getUsersHandler,
  getUser,
  updateMyProfile,
  getMe,
} = require('./../controllers/userController');

const {
  uploadPhotoToServer,
  uploadPhotoToCloudinary,
} = require('./../controllers/photoUploadController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:userId/reviews', reviewRouter);

//Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/validateEmail/:token', validateEmail);

router.get('/', getUsersHandler);
router.get('/me', protect, getMe, getUser);
router.get('/:id', getUser);

//Protected routes
router.use(protect);

router.patch('/updateMyPassword', updateMyPassword);
router.patch(
  '/updateMyProfile',
  uploadPhotoToServer,
  uploadPhotoToCloudinary('User'),
  updateMyProfile
);

module.exports = router;
