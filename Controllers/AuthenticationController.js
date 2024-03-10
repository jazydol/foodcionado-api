const { promisify } = require('util');
const catchAsync = require('../Utils/catchAsync');
const User = require('./../Models/UserModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../Utils/appError');
const sendEmail = require('../Utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECTET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}`,
  });
};

const createSendToken = (user, statusCode, res) => {
  // Get the current date
  let currentDate = new Date(Date.now());

  // Add one day to the current date
  currentDate.setDate(currentDate.getDate() + 1);

  const token = signToken(user._id);
  const cookieOptions = {
    expires: currentDate,
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true
  }

  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    expires: cookieOptions.expires,
    user
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email & password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) check if user exist & passowrd is correct
  const loginUser = await User.findOne({ email }).select('+password'); // get the user using the email from user collection

  if (
    !loginUser ||
    !(await loginUser.correctPassword(password, loginUser.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // if all is ok send JWT to client
  createSendToken(loginUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's here
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Your are not logged in! please login to get access', 401)
    );
  }
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECTET);

  // 3) Check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token is no longer exist', 401)
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The Password was changed, please login again with correct criteria',
        401
      )
    );
  }

  // FINALLY GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have the permission to do this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });


  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} if you didn't forget your password ignore this email`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is (valid for 10 min)',
      message
    })

    res.status(200).json({
      status: 'scucess',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was error sending the email, Please try again later!', 500))
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token is not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is INVALED or has EXPORED', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update changePassportAt prop

  // 4) Log the user in
  createSendToken(user, 200, res);
});


exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!await user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Please enter the correct password', 401))
  }

  // 3) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) Login user in, send JWT
  createSendToken(user, 200, res);
});