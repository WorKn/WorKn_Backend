const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updateMyPassword,
  logout,
  validateEmail,
} = require('./../controllers/authController');
const {
  getUsersHandler,
  getUser,
  updateMyProfile,
  getMe,
  uploadPhotoToServer,
  uploadPhotoToCloudinary,
} = require('./../controllers/userController');
const router = express.Router();

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
  uploadPhotoToCloudinary,
  updateMyProfile
);

module.exports = router;
