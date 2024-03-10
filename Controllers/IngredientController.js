const Ingredient = require('./../Models/IngredientModel');
const APIFeatures = require('./../Utils/APIFeatures');
const catchAsync = require('./../Utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllIngredientsWithRecipes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Ingredient.find().populate('recipes'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const ingredients = await features.query;

  res.status(200).json({
    status: 'success',
    results: ingredients.length,
    data: {
      ingredients: ingredients,
    },
  });
});

exports.getAllIngredients = factory.getAll(Ingredient, "ingredients");
exports.getOneIngredient = factory.getOne(Ingredient, "ingredient", { path: "recipes" });
exports.createIngredient = factory.createOne(Ingredient, "ingredient");
exports.updateIngredient = factory.updateOne(Ingredient, "ingredient");
exports.deleteIngredient = factory.deleteOne(Ingredient);