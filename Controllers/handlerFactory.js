const APIFeatures = require('../Utils/APIFeatures');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError')

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No Document Found With That Id`, 404)); // return typed for not going to next step after (if)
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model, type) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No Document Found With That Id`, 404)); // return typed for not going to next step after (if)
    }

    res.status(200).json({
      status: 'success',
      data: {
        [type]: doc,
      },
    });
  });

exports.createOne = (Model, type) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      message: 'success',
      data: {
        [type]: doc,
      },
    });
  });

exports.getOne = (Model, type, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${type} Found With That Id`, 404));
    }

    res.status(200).json({
      status: 'success',
      [type]: doc,
    });
  });

exports.getOneOrMany = (Model, type, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find({ _id: { $in: req.params.id.split(',') } });

    if (popOptions) query = query.populate(popOptions);

    const docs = await query;

    if (!TextDecoderStream) {
      return next(new AppError(`No ${type} Found With That Id`, 404));
    }

    res.status(200).json({
      status: 'success',
      results: docs.length,
      [type]: docs,
    });
  });

exports.getAll = (Model, type) =>
  catchAsync(async (req, res, next) => {
    // Allow nested routes
    let filter = {};
    if (req.params.recipeId) filter = { recipe: req.params.recipeId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()

    const { page, totalPages, skip, limit } = await features.pagination();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      page,
      totalPages,
      results: docs.length,
      data: {
        [type]: docs,
      },
    });
  });
