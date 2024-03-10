const express = require('express');
const ingredientController = require('../Controllers/IngredientController');
const authController = require('../Controllers/AuthenticationController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, ingredientController.getAllIngredients)
  .post(authController.protect, ingredientController.createIngredient);

router
  .route('/allWithRecipes')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'modirator'),
    ingredientController.getAllIngredientsWithRecipes
  );

router
  .route('/:id')
  .get(ingredientController.getOneIngredient)
  .patch(authController.protect, ingredientController.updateIngredient)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'modirator'),
    ingredientController.deleteIngredient
  );

module.exports = router;
