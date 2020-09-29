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

    query = getOneFieldsHandler(Model, query, req);
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

    features.query = getAllFieldsHandler(Model, features.query);
    //Execute query
    let docs = await features.query;

    docs = filterDocuments(Model, docs);

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

const getOneFieldsHandler = (Model, query, req) => {
  let fieldsToShow = '';
  switch (Model.modelName) {
    case 'User':
      if (req.user && req.params.id === req.user.id) {
        fieldsToShow = '+location +phone +identificationNumber +chats';
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

const getAllFieldsHandler = (Model, query) => {
  switch (Model.modelName) {
    case 'Offer':
      const fieldsToShow = '_id name email profilePicture';
      query.populate({
        path: 'organization',
        select: fieldsToShow + ' phone',
      });

      //TODO: do this populate conditionaly, if there is no org
      query.populate({
        path: 'createdBy',
        select: fieldsToShow,
      });

      query.populate({
        path: 'category',
        select: '-__v',
      });
      break;
    case 'User':
      query.populate({
        path: 'category',
        select: '-__v',
      });

      query.select('-isEmailValidated');
      break;

    default:
      break;
  }
  return query;
};

const filterDocuments = (Model, docs) => {
  switch (Model.modelName) {
    case 'User':
      docs = docs.filter((doc) => doc.isSignupCompleted);
      break;

    default:
      break;
  }

  return docs;
};
