const AppError = require('../Utils/appError');
const helpers = require('../Utils/helpers');
const User = require('./../Models/UserModel');
const catchAsync = require('./../Utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const multerStorage = multerS3({
  s3: s3,
  bucket: 'foodcionadousers',
  acl: 'public-read',
  key: (req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const ext = file.mimetype.split('/')[1];
    cb(null, helpers.generateUniqueAwsImageName('users', name, ext));
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please Upload Image files!'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 100000 },
});

exports.uploadUserPhoto = upload.single('photo');

exports.insertUserPhotoLink = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.key = req.file.location;

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObj[ele] = obj[ele];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user post password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filterd out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) {
    // Delete the old photo if it exists
    if (req.user.photo) {
      const oldPhotoKey = req.user.photo.split('/').pop();
      console.log('old key', oldPhotoKey);
      try {
        await s3
          .deleteObject({ Bucket: 'foodcionadousers', Key: oldPhotoKey })
          .promise();
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    filteredBody.photo = req.file.key;
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User, 'users');
exports.getUser = factory.getOne(User, 'user');
exports.updateUser = factory.updateOne(User, 'user');
exports.deleteUser = factory.deleteOne(User);
