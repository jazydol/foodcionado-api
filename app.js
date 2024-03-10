const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { swaggerDefinition, swaggerDocs } = require('./Swagger/swaggerConfig');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const ingredientRouter = require('./Routes/IngredientRoutes');
const recipeRouter = require('./Routes/RecipeRoutes');
const tourRouter = require('./Routes/TourRoutes');
const userRouter = require('./Routes/UserRoutes');
const reviewRouter = require('./Routes/ReviewRoutes');

const app = express();

// Define Swagger specification
const specs = swaggerJsdoc({
  ...swaggerDefinition,
  apis: ['./Routes/*.js', './swagger/swaggerDocs.js'], // Include the swaggerDocs file
});

// Serve Swagger UI at /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// security HTTP headers
app.use(helmet());

// cors
app.use(cors());

// GLOBAL middlewares

//HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limiting login attempts to 100
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api/v1/users/login', limiter);

// body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter polution
app.use(
  hpp({
    whitelist: ['duration'], // whtie list of the parameters that will be allowed to doublicated
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/recipes', recipeRouter);
app.use('/api/v1/ingredients', ingredientRouter);
app.use('/api/v1/reviews', reviewRouter);

// 404 route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
