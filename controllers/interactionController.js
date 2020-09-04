const Interaction = require('./../models/InteractionModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');



exports.createInteraction = catchAsync(async (req, res, next) => {
  const user = req.user;
  userType = user.userType;
  const interactionOffer = req.body.offer;
  let interactionState, interactionOfferer, interactionApplicant;
  const target = await User.findById(req.body.applicant);

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

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Interaction created',
      interaction,
    },
  });
});

exports.acceptInteraction  = catchAsync( async(req,res,next) =>{

  let interaction = await Interaction.findById(req.body.offerID);
  if(!interaction || interaction.state=="deleted"){
    return next(
      new AppError("Esta interacción no está disponible o no existe, lo sentimos.",400)
    )
  }
  const user = req.user;
  if(interaction.applicant && interaction.applicant==user.id){
    return next(
      new AppError("Usted no puede aceptar esta interacción, debe esperar que el ofertante acepte, lo sentimos.")
    )
  }
  else if (interaction.offerer && interaction.offerer==user.id){
    return next(
      new AppError("Usted no puede aceptar esta interacción, debe esperar que el usuario a quien le ofreció la oferta acepte, lo sentimos.")
    )
  }
  interaction.state="match";
  interaction.save();
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Match stablished',
      interaction,
    },
  });
});