const Interaction = require('./../models/InteractionModel');
const User = require('./../models/userModel');
const Offer = require('./../models/offerModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.validateCreateInteraction = catchAsync(async (req, res, next) => {
  if (req.user.userType === 'offerer') {
    const applicant = await User.findById(req.body.applicant);

  if (userType === 'offerer') {
    if (!target) {
      return next(new AppError('Usuario no encontrado.', 404));
    }
    if (user.id == req.body.applicant) {
      return next(new AppError('Usted no puede mostrar interes en si mismo.', 400));
    }
    if (userType == target.userType) {
      return next(
        new AppError(
          'Usted no puede mostrar interes por alguien de su misma categoria, por favor, seleccione otro usuario.',
          400
        )
      );
    }
  }

  next();
});

exports.createInteraction = catchAsync(async (req, res, next) => {
  let interactionState, interactionOfferer, interactionApplicant;

  if (req.user.userType === 'offerer') {
    interactionState = 'interested';
    interactionOfferer = user.id;
    interactionApplicant = req.body.applicant;
  }
  let interaction = await Interaction.findOne({
    offer: interactionOffer,
    applicant: interactionApplicant,
    offerer: interactionOfferer,
  });
  if (interaction) {
    return next(
      new AppError('Usted ya tiene una interacción con esta oferta, por favor, verifique', 400)
    );
  }
  interaction = await Interaction.create({
    state: interactionState,
    offer: interactionOffer,
    applicant: interactionApplicant,
    offerer: interactionOfferer,
  });

  res.status(201).json({
    status: 'success',
    data: {
      interaction,
    },
  });
});

exports.acceptInteraction = catchAsync(async (req, res, next) => {
  let interaction = await Interaction.findById(req.params.id).populate({
    path: 'offer',
    select: 'organization',
    select: 'createdBy',
  });
  if (!interaction || interaction.state == 'deleted') {
    return next(
      new AppError('Esta interacción no está disponible o no existe, lo sentimos.', 404)
    );
  }
  if (interaction.state == 'match') {
    return next(new AppError('Usted ya está en contacto', 400));
  }

  if (interaction.offerer) {
    if (req.user.organization) {
      if (
        interaction.offerer.equals(req.user.id) ||
        req.user.organization.equals(interaction.offerer.organization)
      ) {
        return next(
          new AppError(
            'Usted no puede aceptar esta interacción, debe esperar que el usuario a quien le ofreció la oferta decida, lo sentimos.',
            400
          )
        );
      }
    } else if (interaction.offerer.equals(req.user.id)) {
      new AppError(
        'Usted no puede aceptar esta interacción, debe esperar que el usuario a quien le ofreció la oferta decida, lo sentimos.',
        400
      );
    }
  } else if (interaction.applicant && interaction.applicant.equals(req.user.id)) {
    return next(
      new AppError(
        'Usted no puede aceptar esta interacción, debe esperar que el ofertante decida, lo sentimos.',
        400
      )
    );
  }

  if (interaction.offerer) {
    if (interaction.applicant.equals(req.user.id)) {
      interaction.state = 'match';
    } else {
      return next(new AppError('Esta oferta no está dirigida hacia usted, lo sentimos.', 400));
    }
  } else {
    if (req.user.organization) {
      if (req.user.organization.equals(interaction.offer.organization)) {
        interaction.state = 'match';
        interaction.offerer = req.user.id;
      }
    } else if (interaction.offer.createdBy.equals(req.user.id)) {
      interaction.state = 'match';
      interaction.offerer = req.user.id;
    }
  }

  interaction.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Match stablished',
      interaction,
    },
  });
});

exports.rejectInteraction = catchAsync(async (req, res, next) => {
  let interaction = await Interaction.findById(req.params.id).populate({
    path: 'offer',
    select: 'organization',
  });
  if (!interaction || interaction.state == 'deleted') {
    return next(
      new AppError('Esta interacción no está disponible o no existe, lo sentimos.', 404)
    );
  }
  if (interaction.state == 'match') {
    return next(new AppError('Usted ya está en contacto, no puede rechazar ahora', 401));
  }

  if (interaction.offerer) {
    if (req.user.organization) {
      if (
        interaction.offerer.equals(req.user.id) ||
        req.user.organization.equals(interaction.offerer.organization)
      ) {
        return next(
          new AppError(
            'Usted no puede rechazar esta interacción, debe esperar que el usuario a quien le ofreció la oferta decida,' +
              'lo sentimos. Si ya no está interesado en este usuario, la puede cancelar. ',
            400
          )
        );
      }
    } else if (interaction.offerer.equals(req.user.id)) {
      new AppError(
        'Usted no puede rechazar esta interacción, debe esperar que el usuario a quien le ofreció la oferta decida,' +
          'lo sentimos. Si ya no está interesado en este usuario, la puede cancelar. ',
        400
      );
    }
  } else if (interaction.applicant && interaction.applicant.equals(req.user.id)) {
    return next(
      new AppError(
        'Usted no puede rechazar esta interacción, debe esperar que el ofertante tome acción, lo sentimos.' +
          'Si ya no está interesado en esta oferta, puede cancelarla su aplicación.',
        401
      )
    );
  }

  if (interaction.offerer) {
    if (interaction.applicant.equals(req.user.id)) {
      interaction.rejected = true;
    } else {
      return next(new AppError('Esta oferta no está dirigida hacia usted, lo sentimos.', 400));
    }
  } else if (req.user.organization.equals(interaction.offer.organization)) {
    interaction.rejected = true;
  }

  interaction.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Interaction rejected',
      interaction,
    },
  });
});

exports.cancelInteraction = catchAsync(async (req, res, next) => {
  let interaction = await Interaction.findById(req.params.id).populate({
    path: 'offer',
    select: 'organization',
  });

  if (!interaction || interaction.state == 'deleted') {
    return next(
      new AppError('Esta interacción no está disponible o no existe, lo sentimos.', 404)
    );
  }
  if (interaction.state != 'match') {
    if (interaction.offerer) {
      if (req.user.organization) {
        if (
          interaction.offerer.equals(req.user.id) ||
          req.user.organization.equals(interaction.offer.organization)
        ) {
          interaction.state = 'deleted';
        }
      } else if (interaction.offerer.equals(req.user.id)) {
        interaction.state = 'deleted';
      }
    } else if (interaction.applicant.equals(req.user.id)) {
      interaction.state = 'deleted';
    }
  }

  if (interaction.state != 'deleted') {
    return next(
      new AppError('Usted no está autorizado para realizar esta acción, lo sentimos.', 401)
    );
  }
  interaction.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Your interaction was canceled successfully',
      interaction,
    },
  });
});

exports.getMyInteractions = catchAsync(async (req, res, nect) => {
  let interactions = [];
  let parsedInteractions = {};
  const fieldsToShow = '_id name email profilePicture';

  if (req.user.userType == 'applicant') {
    interactions = await Interaction.find({ applicant: req.user.id })
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
      .select('-__v');
  } else if (req.user.userType == 'offerer') {
    interactions = await Interaction.find({ offer: req.query.offer })
      .populate({
        path: 'applicant',
        populate: [{ path: 'category', select: '-__v' }],
      })
      .select('-__v');
  }

  parsedInteractions.applied = interactions.filter(
    (interaction) => interaction.state === 'applied'
  );
  parsedInteractions.interested = interactions.filter(
    (interaction) => interaction.state === 'interested'
  );
  parsedInteractions.match = interactions.filter(
    (interaction) => interaction.state === 'match'
  );

  res.status(200).json({
    status: 'success',
    results: interactions.length,
    data: {
      interactions: parsedInteractions,
    },
  });
});

exports.protectOfferInteraction = catchAsync(async (req, res, next) => {
  let offer = undefined;

  if (req.body.offer) offer = await Offer.findById(req.body.offer);
  else if (req.query.offer) offer = await Offer.findById(req.query.offer);

  if (!offer) {
    return next(new AppError('No se ha podido encontrar la oferta especificada.', 404));
  }

  if (req.user.userType != 'offerer') return next();

  if (req.user.id != offer.createdBy) {
    if (req.user.organization) {
      if (req.user.organization != offer.organization) {
        return next(
          new AppError(
            'Usted no tiene autorización de interactuar con la oferta especificada.',
            401
          )
        );
      }
    } else {
      return next(
        new AppError(
          'Usted no tiene autorización de interactuar con la oferta especificada.',
          401
        )
      );
    }
  }

  next();
});
