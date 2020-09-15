const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const Interaction = require('../models/InteractionModel');

exports.validateInteraction = catchAsync(async (req, res, next) => {
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
        401
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

    req.user2 = { id: interaction.offerer.id };
  } else if (req.user.userType === 'offerer') {
    if (req.user.organization) {
      if (!req.user.organization.equals(interaction.offerer.organization)) {
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

    req.user2 = { id: interaction.applicant };
  }

  next();
});

exports.protectChat = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id).select('-__v');

  if (!chat) {
    return next(new AppError('Chat no encontrado.', 404));
  }

  if (req.user.id != chat.user1 && req.user.id != chat.user2) {
    return next(
      new AppError('No tiene permiso de enviar un mensaje en el chat especificado.', 401)
    );
  }

  if (!chat.isLive) {
    return next(new AppError('Chat inactivo.', 400));
  }

  req.chat = chat;

  next();
});

exports.createChat = catchAsync(async (req, res, next) => {
  if (!req.body.message) {
    return next(new AppError('Por favor, ingrese un mensaje.', 400));
  }

  let chat;

  const message = await Message.create({
    message: req.body.message,
    sender: req.user.id,
  });

  const query = { $in: [req.user.id, req.user2.id] };
  chat = await Chat.findOne({ user1: query, user2: query });

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

    let user2 = await User.findById(req.user2.id).select('+chats');

    req.user.chats.push(chat.id);
    user2.chats.push(chat.id);

    await req.user.save({ validateBeforeSave: false });
    await user2.save({ validateBeforeSave: false });
  }

  const io = req.app.get('socketio');
  io.emit('chat_message', message.message);

  res.status(201).json({
    status: 'success',
    data: {
      chat,
    },
  });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  if (!req.body.message) {
    return next(new AppError('Por favor, ingrese un mensaje.', 400));
  }

  let chat = req.chat;

  const message = await Message.create({
    message: req.body.message,
    sender: req.user.id,
  });

  chat.messages.push(message.id);
  chat = await chat.save();

  const io = req.app.get('socketio');
  io.emit('chat_message', message.message);

  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.getMyChats = catchAsync(async (req, res, next) => {
  // const userToPopulate = req.user.id == req.chat.user1 ? 'user2' : 'user1';

  const user = await req.user
    .populate({
      path: 'chats',
      select: '-__v -messages',
      populate: [
        {
          path: 'user1',
          match: { _id: { $ne: req.user.id } },
          select: '_id name lastname profilePicture',
        },
        {
          path: 'user2',
          match: { _id: { $ne: req.user.id } },
          select: '_id name lastname profilePicture',
        },
      ],
    })
    .execPopulate();

  res.status(200).json({
    status: 'success',
    data: {
      chats: user.chats,
    },
  });
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  // const userToPopulate = req.user.id == req.chat.user1 ? 'user2' : 'user1';

  let chat = await req.chat
    .populate({ path: 'messages', select: '-__v' })
    // .populate({ path: userToPopulate, select: '_id name lastname profilePicture' })
    .populate({
      path: 'user1',
      match: { _id: { $ne: req.user.id } },
      select: '_id name lastname profilePicture',
    })
    .populate({
      path: 'user2',
      match: { _id: { $ne: req.user.id } },
      select: '_id name lastname profilePicture',
    })
    .execPopulate();

  // chat = renameObtKey(chat, userToPopulate, 'user');
  // if (userToPopulate == 'user1') chat.user = chat.user1;
  // else chat.user = chat.user2;

  // chat.user1 = undefined;
  // chat.user2 = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      chat,
    },
  });
});
