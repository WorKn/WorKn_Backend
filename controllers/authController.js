const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { requiredPaths } = require('../schemas/locationSchema');
const sendEmail = require('./../utils/email');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'No se pudo encontrar a un usuario registrado con el email proporcionado.',
        404
      )
    );
  }

  //Generate reset token and save user document
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send email to user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Ha solicitado restaurar su contraseña? Envíe un PATCH request al suguiente url: ${resetURL}.\n
  Si no ha olvidado su contraseña, por favor ignore este mensaje.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Restauración de contraseña (válido por 10 minutos)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Ha ocurrido un error tratando de enviarle el email de restauración. Por favor, inténtelo de nuevo más atrde',
        500
      )
    );
  }
});
