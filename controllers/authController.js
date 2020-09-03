const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const getClientHost = require('./../utils/getClientHost');

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
    cookieOptions.secure = false; //Remember change this to true when Https be available
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
    lastname: req.body.lastname,
    email: req.body.email,
    birthday: req.body.birthday,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userType: req.body.userType,
    organizationRole: req.body.organizationRole,
    organization: req.body.organization,
  });

  newUser.sendValidationEmail(req);
  await newUser.save({ validateBeforeSave: false });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor, provea el email y contraseña', 400));
  }

  const user = await User.findOne({ email }).select(
    '+password +location +phone +identificationNumber'
  );

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Email o contraseña incorrecta', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select('+tokens');

  if (!user) {
    return next(
      new AppError(
        'No se pudo encontrar a un usuario registrado con el email proporcionado.',
        404
      )
    );
  }

  //Generate reset token and save user document
  const resetToken = user.generateToken('password');
  await user.save({ validateBeforeSave: false });

  //Send email to user
  const resetURL = `${getClientHost(req)}/resetPassword/${resetToken}`;

  const message = `Para validar restaurar su contraseña, por favor, haga clic en el siguiente enlace: ${resetURL}\n
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
    user.cleanTokensArray('password');

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Ha ocurrido un error tratando de enviarle el email de restauración. Por favor, inténtelo de nuevo más atrde',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Find user using the token. But first we need to hash it
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    tokens: {
      $elemMatch: {
        token: hashedToken,
        tokenType: 'password',
        expireDate: { $gt: Date.now() },
      },
    },
  }).select('+tokens');

  if (!user) {
    return next(new AppError('Token inválido o expirado', 400));
  }

  //Update password, clean tokens's array and save user document
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.cleanTokensArray('password');

  await user.save();

  //Log user in
  createSendToken(user, 200, res);
});

exports.validateEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    tokens: {
      $elemMatch: { token: hashedToken, tokenType: 'email' },
    },
  }).select('+tokens');

  if (!user) {
    return next(new AppError('Token inválido.', 400));
  }

  user.isEmailValidated = true;

  user.cleanTokensArray('email');

  await user.save({ validateBeforeSave: false });

  //Log user in
  createSendToken(user, 200, res);
});

exports.verifyEmailValidation = catchAsync(async (req, res, next) => {
  if (req.user.isEmailValidated) next();
  else
    return next(
      new AppError('Por favor, valide su email para poder utilizar esta función.', 401)
    );
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  //Verify that user's currect password is correct
  if (!(await user.verifyPassword(currentPassword, user.password))) {
    return next(new AppError('Contraseña incorrecta.', 401));
  }

  //Update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  //Save user and run validators
  await user.save();

  //Log user in
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

exports.restricTo = (...admittedRoles) => {
  return (req, res, next) => {
    if (
      !admittedRoles.includes(req.user.userType) &&
      !admittedRoles.includes(req.user.organizationRole)
    ) {
      return next(
        new AppError('Usted no puede realizar esta acción porque excede sus permisos', 402)
      );
    }
    next();
  };
};
