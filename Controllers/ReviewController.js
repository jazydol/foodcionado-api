const Review = require('../Models/ReviewModel');
const factory = require('./handlerFactory');

exports.setReviewUserId = (req, res, next) => {
  // Allow nested route
  if (!req.body.recipe) req.body.recipe = req.params.recipeId;
  req.body.user = req.user.id;
  next();
}

exports.getAllReviews = factory.getAll(Review, "reviews");
exports.getOneReview = factory.getOne(Review, "review");
exports.createReview = factory.createOne(Review, "review");
exports.updateReview = factory.updateOne(Review, "review");
exports.deleteReview = factory.deleteOne(Review);