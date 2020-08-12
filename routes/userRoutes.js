const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('./../controllers/authController');
const { getAllUsers } = require('./../controllers/userController');
const router = express.Router();

//Routes
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//Protected routes
router.use(protect);

router.patch('/updatePassword/', updatePassword);
router.get('/', getAllUsers);

module.exports = router;
