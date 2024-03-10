const AppError = require('./../Utils/appError');
const { CastError } = require('mongoose');

const handleCastErrorDB = (err) => {
  const message = `Invalid error ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid Token, Please Login again', 401);
};

const handleJWTExpiredError = (err) => {
  return new AppError('Your Login session expired, please Login again', 401);
};

const handleDuplicateFieldDB = (err) => {
  const message = `Duplicate field value: (${err.keyValue.name}) please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // Operational Error: sending message for client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming Error or other unknown error: don't leak error details
  } else {
    // Logging it to ourself
    console.error('ERROR', err);

    // sending message to client
    res.status(err.statusCode).json({
      status: 'Error',
      message: 'Something Went Wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error instanceof CastError) error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProduction(error, res);
  }
};
