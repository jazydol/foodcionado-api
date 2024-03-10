/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An ingredient must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'An ingredient name must have less or equal to 40 char'],
      minlength: [2, 'An ingredient name must have more or equal to 10 char'],
      // validate: [validator.isAlpha, 'ingredient name must be charcters'],
    },
    slug: String,
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      // required: [true, 'An ingredient must have an image'],
    },
    images: {
      type: [String],
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    cretedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ingredientSchema.index({ name: 1 });
ingredientSchema.index({ slug: 1 });

ingredientSchema.virtual('recipes', {
  ref: 'Recipe',
  foreignField: 'ingredients',
  localField: '_id',
});

// Document middleware before .save() and .create()
ingredientSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
