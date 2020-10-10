const catchAsync = require('../utils/catchAsync');
const tagUser = require('../models/tagUserModel');
const TagOffer = require('./../models/tagOfferModel');
const Offer = require('../models/offerModel');
const AppError = require('./../utils/appError');

exports.getOfferRecommendation = catchAsync(async (req, res, next) => {
  if (req.user.userType != 'applicant') {
    return next(
      new AppError(
        'Lo sentimos,pero solo podemos recomendar ofertas a un aplicante',
        403
      )
    );
  }
  const fieldsToShow = '_id name email profilePicture';
  tags = await TagOffer.find({ tag: { $in: req.user.tags } })
    .populate({
      path: 'offer',
      select: '-__v',
      match: {state: { $nin: ['deleted', 'paused']}},
      populate: [
        { path: 'category', select: '-__v' },
        { path: 'organization', select: fieldsToShow + ' phone' },
        {
          path: 'createdBy',
          select: fieldsToShow,
        },
      ],
    })
    .select('-__v');
  recommended = new Set();
  while (recommended.size != 20 && tags.length > 0) {
    position = Math.floor(Math.random() * tags.length) + 0;
    recommended.add(tags[position].offer);
    tags.splice(position, 1);
  }
  recommended = Array.from(recommended);
  res.status(200).json({
    status: 'success',
    results: recommended.length,
    data: {
        offers: recommended,
    },
  });
});

exports.getUserRecommendation = catchAsync(async (req, res, next) => {
  if (req.user.userType != 'offerer') {
    return next(
      new AppError(
        'Lo sentimos, no podemos recomendarte usuarios debido a que usted no es un ofertante.',
        403
      )
    );
  }
  offersRecommended = [];
  recommendedCount = 0;
  offers = await Offer.find({
    organization: req.user.organization,
    state: { $nin: ['deleted', 'paused']},
  });
  for (let offer of offers) {
    tags = [];
    offer.tags.forEach((tag) => {
      tags.push(tag.id);
    });

    tagsUser = await tagUser.find({ tag: { $in: tags } }).populate('user');
    usersTags = Array.from(tagsUser);
    recommended = new Set();

    while (recommended.size != 20 && usersTags.length > 0) {
      position = Math.floor(Math.random() * usersTags.length) + 0;
      recommended.add(usersTags[position].user);
      usersTags.splice(position, 1);
    }

    recommendedCount += recommended.size;
    const obj = JSON.parse(JSON.stringify(offer));
    obj.recommended = Array.from(recommended);
    offersRecommended.push(obj);
  }
  res.status(200).json({
    status: 'success',
    results: recommendedCount,
    data: {
      offers: offersRecommended,
    },
  });
});
