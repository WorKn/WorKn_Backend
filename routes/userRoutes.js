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
  getAllUsers,
  getUser,
  updateMyProfile,
  getMe,
} = require('./../controllers/userController');
const skipRoute = require('./../utils/skipRoute');
const router = express.Router();

//Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/validateEmail/:token', validateEmail);

router.get('/', getAllUsers);
router.get('/:id', skipRoute('me'), getUser);

//Protected routes
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updateMyPassword);
router.patch('/updateMyProfile', updateMyProfile);

module.exports = router;
