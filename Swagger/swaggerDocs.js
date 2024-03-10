/**
   * @swagger
   * /api/v1/recipes:
   *   get:
   *     summary: Get a list of recipes
   *     tags: [Recipe]
   *     description: Retrieve a list of recipes from the database.
   *     responses:
   *       '200':
   *         description: A successful response
   *         content:
   *          application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#components/schemas/Recipe'
   *       '404':
   *            description: not found
   */

/**
   * @swagger
   * /api/v1/recipes:
   *   post:
   *     summary: Post Recipe
   *     tags: [Recipe]
   *     description: Post Recipe.
   *     responses:
   *       '200':
   *         description: A successful response
   *         content:
   *          application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#components/schemas/Recipe'
   *       '404':
   *            description: not found
   */

/**
   * @swagger
   * /api/v1/ingredients:
   *   get:
   *     summary: Get a list of Ingredient
   *     tags: [Ingredient]
   *     description: Retrieve a list of users from the database.
   *     responses:
   *       '200':
   *         description: A successful response
   *         content:
   *          application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#components/schemas/Ingredient'
   *       '404':
   *            description: not found
   */

/**
   * @swagger
   * /api/v1/ingredients:
   *   post:
   *     summary: Post one Ingredient
   *     tags: [Ingredient]
   *     description: Post Ingredient.
   *     responses:
   *       '200':
   *         description: A successful response
   *         content:
   *          application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#components/schemas/Ingredient'
   *       '404':
   *            description: not found
   */