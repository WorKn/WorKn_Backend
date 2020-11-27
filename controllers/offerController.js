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
  try {
    if (!req.user.organization && req.user.organizationRole) {
      return next(
        new AppError(
          'Parece ser que usted figura como miembro de una organización pero no está vinculada a ninguna. No podemos permitirle crear esta oferta',
          403
        )
      );
    }
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
  } catch (error) {
    return next(
      new AppError('Lo sentimos, algo salió mal al crear su oferta, intente nuevamente', 500)
    );
  }
});

exports.editOffer = catchAsync(async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(
      new AppError('Lo sentimos, algo salió mal al editar su oferta, intente nuevamente', 500)
    );
  }
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

exports.getMyOffers = catchAsync(async (req, res, next) => {
  let offers = [];
  if (req.user.organization) {
    offers = await Offer.find({ organization: req.user.organization }).select('+updatedAt');
  } else {
    offers = await Offer.find({ createdBy: req.user.id }).select('+updatedAt');
  }

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: {
      offers,
    },
  });
});

const getOfferWithTags = async (req, res) => {
  const fieldsToShow = '_id name email profilePicture';
  tags = await TagOffer.find({ tag: { $in: req.query.tags } })
    .populate({
      path: 'offer',
      select: '-__v',
      populate: [
        { path: 'category', select: '-__v' },
        { path: 'organization', select: fieldsToShow + ' phone' },
        {
          path: 'createdBy',
          select: fieldsToShow,
        },
      ],
    })
  .select('-__v')

  const offers = new Set();
  tags.forEach(async (tagOffer) => {
    offers.add(tagOffer.offer);
  });
  res.status(200).json({
    status: 'success',
    results: offers.size,
    data: {
      offers: Array.from(offers),
    },
  });
};

exports.GetOffersHandler  = catchAsync(async(req, res, next)=>{
  req.query.tags? getOfferWithTags(req,res) : this.getAllOffers(req,res,next);
});
