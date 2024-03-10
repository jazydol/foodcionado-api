/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Recipe must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A Recipe name must have less or equal to 40 char'],
      minlength: [4, 'A Recipe name must have more or equal to 10 char'],
      // validate: [validator.isAlpha, 'Recipe name must be charcters'],
    },
    slug: String,
    cookTime: {
      type: Number,
      required: [true, 'a Recipe must have cookTime'],
    },
    difficulty: {
      type: String,
      required: [true, 'a Recipe should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficult is either: easy, medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A Rating myust be above one and max 5'],
      max: [5, 'A Rating myust be above one and max 5'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Recipe must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Recipe must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Recipe must have an image'],
    },
    images: {
      type: [String],
    },
    likers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    cretedAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    ingredients: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Ingredient',
        required: [true, 'Ingredient should have a Ingredient(s)'],
      },
    ],
    cooker: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Recipe should have a Cooker'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recipeSchema.index({ name: 1 });
recipeSchema.index({ slug: 1 });
recipeSchema.index({ cookTime: 1 });

// Document middleware before .save() and .create()
recipeSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

recipeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'recipe',
  localField: '_id',
});

recipeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cooker',
    select: 'name role _id photo',
  });

  next();
});

// recipeSchema.post('save', function (doc, next) {
//   console.log(doc);

//   next();
// });


const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
