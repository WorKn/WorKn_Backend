const AppError = require('./../utils/appError');

const handleJWTError = () => new AppError('Por favor, inicie sesión nuevamente.', 401);

//Sending errors in a Development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//Sending errors in a Production/Staging environment
const sendErrorProd = (err, res) => {
  // Errors created by us, in other words trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unkown error: don't leak error details
  else {
    // 1) Log error
    console.error('ERROR: ', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

//Error handling middleware (uses 4 parameters), express automatically detect it.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
      error = handleJWTError();

    sendErrorProd(error, res);
  }
};
