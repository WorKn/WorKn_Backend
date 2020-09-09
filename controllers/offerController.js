const catchAsync = require('../utils/catchAsync');
const filterObj = require('./../utils/filterObj');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const updateTags = require('./../utils/updateTags');

const Offer = require('../models/offerModel');
const TagOffer = require('./../models/tagOfferModel');
const Tag = require('./../models/tagModel');

exports.protectOffer = catchAsync(async (req, res, next) => {
  offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(new AppError('No se ha podido encontrar la oferta especificada.', 404));
  }

  if (req.user.id != offer.createdBy) {
    if (req.user.organization) {
      if (req.user.organization != offer.organization) {
        return next(
          new AppError('Usted no tiene autorización de modificar la oferta especificada.', 401)
        );
      }
    } else {
      return next(
        new AppError('Usted no tiene autorización de modificar la oferta especificada.', 401)
      );
    }
  }

  req.offer = offer;

  next();
});

exports.createOffer = catchAsync(async (req, res, next) => {
  const tagsRef = req.body.tags;

  //Update tag's ref with their values
  req.body.tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-__v');

  const offer = await Offer.create({
    title: req.body.title,
    description: req.body.description,
    offerType: req.body.offerType,
    location: req.body.location,
    createdBy: req.user.id,
    organization: req.user.organization,
    tags: req.body.tags,
    category: req.body.category,
    closingDate: req.body.closingDate,
    salaryRange: req.body.salaryRange,
  });

  //This is necessary due to the current way that updateTags works
  const offerWithoutTags = new Offer(offer);
  offerWithoutTags.tags = [];

  updateTags(offerWithoutTags, tagsRef, TagOffer);

  res.status(201).json({
    status: 'success',
    data: {
      offer,
    },
  });
});

exports.editOffer = catchAsync(async (req, res, next) => {
  const tagsRef = req.body.tags;

  const allowedFields = [
    'title',
    'description',
    'offerType',
    'location',
    'category',
    'closingDate',
    'salaryRange',
    'tags',
  ];

  //Update tag's ref with their values
  if (req.body.tags) {
    req.body.tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-__v');
  }

  //Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, allowedFields);

  // Update offer document
  const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  updatedOffer.save();

  //Update TagOffer records asynchronously
  if (tagsRef) updateTags(req.offer, tagsRef, TagOffer);

  res.status(200).json({
    status: 'success',
    data: {
      offer: updatedOffer,
    },
  });
});

exports.deleteOffer = catchAsync(async (req, res, next) => {
  const deletedOffer = await Offer.findByIdAndUpdate(
    req.params.id,
    { state: 'deleted' },
    {
      new: true,
    }
  );

  if (!deletedOffer) {
    return next(new AppError('No se ha podido encontrar la oferta especificada.', 404));
  }

  deletedOffer.save();

  updateTags(req.offer, [], TagOffer);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllOffers = factory.getAll(Offer);
exports.getOffer = factory.getOne(Offer);

exports.getMyOffers  = catchAsync(async (req, res, next) => {
  let offers = []
  if(req.user.organization){
    offers = await Offer.find({ organization: {$in: req.user.organization}}).select("+updatedAt");
  }else{
    offers = await Offer.find({ createdBy: { $in: req.user.id} }).select("+updatedAt");
  }
  if(offers.length==0){
    return next(new AppError('Usted no posee ninguna oferta asociada, le invitamos a crear una.', 400));
  }
  res.status(201).json({
    status: 'success',
    data: {
      offers,
    },
  });

});