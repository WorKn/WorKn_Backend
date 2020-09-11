const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const Interaction = require('../models/InteractionModel');

exports.protectChat = catchAsync(async (req, res, next) => {
  if (!req.body.message) {
    return next(new AppError('Por favor, ingrese un mensaje.', 404));
  }

  const interaction = await Interaction.findById(req.body.interaction).populate({
    path: 'offerer',
  });

  if (!interaction) {
    return next(new AppError('Interación inválida.', 404));
  }

  if (interaction.state != 'match') {
    return next(
      new AppError(
        'No tiene permiso de iniciar una conversación con el usuario indicado.',
        404
      )
    );
  }

  if (req.user.userType === 'applicant') {
    if (req.user.id != interaction.applicant) {
      return next(
        new AppError(
          'No tiene permiso de iniciar una conversación con el usuario indicado.',
          401
        )
      );
    }

    req.user2.id = interaction.offerer;
  }

  if (req.user.userType === 'offerer') {
    if (req.user.organization) {
      if (
        req.user.id != interaction.offerer.id ||
        req.user.organization != interaction.offerer.organization
      ) {
        return next(
          new AppError(
            'No tiene permiso de iniciar una conversación con el usuario indicado.',
            401
          )
        );
      }
    } else if (req.user.id != interaction.offerer.id) {
      return next(
        new AppError(
          'No tiene permiso de iniciar una conversación con el usuario indicado.',
          401
        )
      );
    }

    req.user2.id = interaction.applicant;
  }

  req.interaction = interaction;

  next();
});

exports.createChat = catchAsync(async (req, res, next) => {
  const message = await Message.create({
    message: req.body.message,
    sender: req.user.id,
  });

  const chat = await Chat.create({
    messages: [message],
    user1: req.user.id,
    user2: req.user2.id,
    isLive: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      chat,
    },
  });
});
