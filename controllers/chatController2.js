const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const Chat = require('../models/chatModel');
const User = require('../models/userModel');
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

    req.user2.id = interaction.offerer.id;
  } else if (req.user.userType === 'offerer') {
    if (req.user.organization) {
      if (
        req.user.id != interaction.offerer.id &&
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

  next();
});

exports.createChat = catchAsync(async (req, res, next) => {
  let chat;

  const message = await Message.create({
    message: req.body.message,
    sender: req.user.id,
  });

  const query = { $in: [req.user.id, req.user2.id] };
  chat = await Chat.find({ user1: query, user2: query });

  if (chat) {
    chat.messages.push(message.id);
    chat = await chat.save();
  } else {
    chat = await Chat.create({
      messages: [message.id],
      user1: req.user.id,
      user2: req.user2.id,
      isLive: true,
    });
  }

  let user2 = await User.findById(req.user2.id).select('+chats');

  req.user.chats.push(chat.id);
  user2.chats.push(chat.id);

  await req.user.save({ validateBeforeSave: false });
  await user2.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: {
      chat,
    },
  });
});
