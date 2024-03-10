const Recipe = require('../Models/RecipeModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const helpers = require('../Utils/helpers');
const catchAsync = require('../Utils/catchAsync');

const multerStorage = multer.memoryStorage();

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
  limits: { fileSize: 1000000 },
});

exports.uploadRecipeImages = upload.fields([
  { name: 'imageCover' },
  { name: 'images' },
]);

exports.resizeRecipeImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover) {
    return next();
  } else {
    req.body.imageCover = herlers.generateUniqueImageName(
      'recipe',
      req.params.id,
      'jpeg',
    );

    await sharp(req.files.imageCover[0].buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/recipes/${req.body.imageCover}`);
  }

  if (!req.files.images) {
    return next();
  } else {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, index) => {
        const fileName = generateUniqueImageName(
          `recipe_${index + 1}`,
          req.params.id,
          'jpeg',
        );

        await sharp(file.buffer)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/recipes/${fileName}`);

        req.body.images.push(fileName);
      }),
    );
  }

  next();
});

exports.getAllRecipes = factory.getAll(Recipe, 'recipes');
exports.getOneOrManyRecipes = factory.getOneOrMany(Recipe, 'recipes', {
  path: 'ingredients reviews',
});
exports.createRecipe = factory.createOne(Recipe, 'recipe');
exports.updateRecipe = factory.updateOne(Recipe, 'recipe');
exports.deleteRecipe = factory.deleteOne(Recipe);
