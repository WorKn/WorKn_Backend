const catchAsync = require('../utils/catchAsync');
const filterObj = require('./../utils/filterObj');
const factory = require('./handlerFactory');

const Offer = require('../models/offerModel');
const TagOffer = require('./../models/tagOfferModel');
const Tag = require('./../models/tagModel');

const updateTagOffer = async (offer, tags) => {
  tags.forEach((tag) => {
    TagOffer.create({ tag, offer }).catch((err) => {
      //Error code 11000 = Duplicate key
      if (err.code != 11000) console.log(err);
    });
  });
};

exports.createOffer = catchAsync(async (req, res, next) => {
  const tagsRef = req.body.tags;

  //Update tag's ref with their values
  req.body.tags = await Tag.find({ _id: { $in: req.body.tags } }).select('-_id -__v');

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

  updateTagOffer(offer.id, tagsRef);

  res.status(201).json({
    status: 'success',
    data: {
      offer,
    },
  });
});

exports.editOffer = catchAsync(async (req, res, next) => {
  allowedFields = [
    'title',
    'description',
    'offerType',
    'location',
    'category',
    'closingDate',
    'salaryRange',
  ];
  offer = await Offer.findById(req.params.id);

  //Verify that offer exists
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

  filteredBody = filterObj(req.body, allowedFields);

  const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      offer: updatedOffer,
    },
  });
});

exports.getAllOffers = factory.getAll(Offer);
exports.getOffer = factory.getOne(Offer);
