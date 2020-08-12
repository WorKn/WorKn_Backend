const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  logout,
} = require('./../controllers/authController');
const { getAllUsers } = require('./../controllers/userController');
const router = express.Router();

//Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.get('/', getAllUsers);

//Protected routes
router.use(protect);

router.patch('/updatePassword/', updatePassword);

module.exports = router;
