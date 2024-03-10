/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const Recipe = require('./RecipeModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      minlength: [4, 'a review must have more or equal to 4 char'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    cretedAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a Review should have a Writer'],
    },
    recipe: {
      type: mongoose.Schema.ObjectId,
      ref: 'Recipe',
      required: [true, 'a Review must belong to a recipe'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRating = async function (recipeId) {
  const stats = await this.aggregate([
    {
      $match: { recipe: recipeId },
    },
    {
      $group: {
        _id: '$recipe',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Recipe.findByIdAndUpdate(recipeId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Recipe.findByIdAndUpdate(recipeId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this poits to current review
  this.constructor.calcAverageRating(this.recipe);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  // await this,findOne() doesn't work here, query already excuted
  if (doc) {
    await doc.constructor.calcAverageRating(doc.recipe);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
