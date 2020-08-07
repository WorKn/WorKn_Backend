const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // Converting from days to miliseconds)
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.userType == 'admin') {
    return next(new AppError('Acción no permitida.', 403));
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    birthday: req.body.birthday,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userType: req.body.userType,
    organizationRole: req.body.organizationRole,
    organization: req.body.organization,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor, provea el email y contraseña', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Email o contraseña incorrecta', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  //If token does not exist, then the user its not logged in
  if (!token) {
    return next(new AppError('No se encuentra logueado.', 401));
  }

  //Note: jwt.verify uses a callback insted of returning a promise, so we use the node built
  //in utils.promisify function to make a promise out of this, and await that function.

  //Validate token and decode
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  //Check if the user owner of the token still exists
  if (!currentUser) {
    return next(new AppError('El usuario ya no existe.', 401));
  }

  //Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'El usuario ha cambiado la contraseña recientemente. Por favor, haga login nuevamente',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});
