const mongooseToSwagger = require('mongoose-to-swagger');
const swaggerDocs = require('./swaggerDocs');
const Recipe = require('../Models/RecipeModel');
const Ingredient = require('../Models/IngredientModel');


const swaggerDefinition = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Foodcionado',
      version: '1.0.0',
      description: 'Description of your API',
    },
    components: {
      schemas: {
        Recipe: mongooseToSwagger(Recipe, 'Recipe', 'definitions'),
        Ingredient: mongooseToSwagger(Ingredient, 'Ingredient', 'definitions')
      }
    },
    servers: [
      {
        url: 'http://localhost:8000', // Update with your API's base URL
        description: 'Local development server',
      },
    ],
  },
  apis: ['./Routes/*.js'], // Update with the path to your route files
};

module.exports = { swaggerDefinition, swaggerDocs };