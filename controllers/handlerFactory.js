const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndRemove(req.params.id);

    if (!doc) {
      return next(new AppError('Elemento no encontrado.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('Elemento no encontrado.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    //If there is a popOption, we want to populate
    if (popOptions) query = query.populate(popOptions);

    query = fieldsHandler(Model, query, req);
    query = query.select('-__v');
    const doc = await query;

    if (!doc) {
      return next(new AppError('Elemento no encontrado.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Execute query
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

const fieldsHandler = (Model, query, req) => {
  let fieldsToShow = '';
  switch (Model.modelName) {
    case 'User':
      if (req.user && req.params.id === req.user.id) {
        fieldsToShow = '+location +phone +identificationNumber';
      }
      break;
    case 'Organization':
      if (req.user && req.params.id === req.user.organization) {
        fieldsToShow = '+members';
        query.populate({ path: 'members' });
      }
      break;

    default:
      break;
  }
  return query.select(fieldsToShow);
};
