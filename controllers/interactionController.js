const Interaction = require('./../models/InteractionModel');
const User = require('./../models/userModel');
const Offer = require('./../models/offerModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createInteraction = catchAsync(async (req, res, next) => {
  const user = req.user;
  userType = user.userType;
  const interactionOffer = req.body.offer;
  let interactionState, interactionOfferer, interactionApplicant;
  const target = await User.findById(req.body.applicant);

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

  if (userType == 'applicant') {
    interactionState = 'applied';
    interactionApplicant = user.id;
  } else if (userType == 'offerer') {
    interactionState = 'interesed';
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

exports.acceptInteraction  = catchAsync( async(req,res,next) =>{

  let interaction = await Interaction.findOne({offer: req.body.offer});
  if(!interaction || interaction.state=="deleted"){
    return next(
      new AppError("Esta interacción no está disponible o no existe, lo sentimos.",400)
    )
  }
  if(interaction.state=="match"){
    return next(
      new AppError("Usted ya está en contacto, felicidades!!",400)
    )
  }
  const user = req.user;
  
  if (interaction.offerer){
    if(interaction.offerer==user.id){
      return next(
        new AppError(
          'Usted no puede aceptar esta interacción, debe esperar que el usuario a quien le ofreció la oferta acepte, lo sentimos.',
          400
        )
      );
    };
    if (req.user.organization) {
      return next(
        new AppError(
          'Usted no puede aceptar esta interacción, debe esperar que el usuario a quien le ofreció la oferta acepte, lo sentimos.',
          400
        )
      );
    } 
  } else if(interaction.applicant && interaction.applicant==user.id){
    return next(
      new AppError(
        'Usted no puede aceptar esta interacción, debe esperar que el ofertante acepte, lo sentimos.',
        400
      )
    );
  }  

  if(interaction.offerer){
    if(interaction.applicant==user.id){
      interaction.state="match";
      console.log("matched in applicant");
    }else{
      return next(new AppError('Esta oferta no está dirigida hacia usted, lo sentimos.', 400));
    }
  }else{
    offerer = await User.findOne({organization: req.offer.organization});
    if(req.user.organization==offerer.organization){
      interaction.state="match";
      console.log("matched in organization");
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
exports.getMyInteractions = catchAsync(async (req, res, nect) => {
  let interactions = [];
  let parsedInteractions = {};

  if (req.user.userType == 'applicant') {
    interactions = await Interaction.find({ applicant: req.user.id }).populate({
      path: 'offer',
    });
  } else if (req.user.userType == 'offerer') {
    interactions = await Interaction.find({ offer: req.body.offer }).populate({
      path: 'applicant',
    });
  }

  parsedInteractions.applied = interactions.filter(
    (interaction) => interaction.state === 'applied'
  );
  parsedInteractions.interesed = interactions.filter(
    (interaction) => interaction.state === 'interesed'
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
  if (req.user.userType != 'offerer') return next();
  offer = await Offer.findById(req.body.offer);

  if (!offer) {
    return next(new AppError('No se ha podido encontrar la oferta especificada.', 404));
  }

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

  req.offer = offer;

  next();
});
