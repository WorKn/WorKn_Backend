const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updateMyPassword,
  logout,
} = require('./../controllers/authController');
const { getAllUsers, getUser, updateMyProfile } = require('./../controllers/userController');
const router = express.Router();

//Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.get('/', getAllUsers);
router.get('/:id', getUser);

//Protected routes
router.use(protect);

router.patch('/updateMyPassword', updateMyPassword);
router.patch('/updateMyProfile', updateMyProfile);

module.exports = router;
