const express = require('express');
const recipeController = require('../Controllers/RecipeController');
const authController = require('../Controllers/AuthenticationController');
const reviewRouter = require('./ReviewRoutes');

const router = express.Router();

router.use('/:recipeId/reviews', reviewRouter);


router
  .route('/')
  .get(recipeController.getAllRecipes)
  .post(authController.protect, recipeController.createRecipe);

router
  .route('/:id')
  .get(recipeController.getOneOrManyRecipes)
  .patch(authController.protect, recipeController.uploadRecipeImages, recipeController.resizeRecipeImages, recipeController.updateRecipe)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'modirator'),
    recipeController.deleteRecipe
  );

module.exports = router;
