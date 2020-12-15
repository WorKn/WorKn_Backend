const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const renameObjtKey = require('../utils/renameObjKey');

const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const Interaction = require('../models/InteractionModel');

exports.validateInteraction = catchAsync(async (req, res, next) => {
  const interaction = await Interaction.findById(req.body.interaction).populate({
    path: 'offerer',
  });

  if (!interaction) {
    return next(new AppError('La interación no existe.', 404));
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
      new AppError('No tiene permiso de interactuar con el chat especificado.', 401)
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
  chat = await Chat.findOne({ user1: query, user2: query, isLive: true });

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

  res.status(201).json({
    status: 'success',
    data: {
      chat, //TODO: Remove this field
      lastMessage: message,
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

  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.closeChat = catchAsync(async (req, res, next) => {
  let chat = req.chat;

  chat.isLive = false;
  chat = await chat.save();

  res.status(200).json({
    status: 'success',
    data: {
      chat,
    },
  });
});

const userChatFields = '_id name lastname profilePicture organization';

const populateUser = (path, userId) => {
  return {
    path,
    match: { _id: { $ne: userId } },
    select: userChatFields,
    populate: {
      path: 'organization',
      select: '_id profilePicture name email',
    },
  };
};

exports.getMyChats = catchAsync(async (req, res, next) => {
  const user = await req.user
    .populate({
      path: 'chats',
      match: { isLive: true },
      select: '_id messages',
      populate: [populateUser('user1', req.user.id), populateUser('user2', req.user.id)],
    })
    .execPopulate();

  let chats = JSON.parse(JSON.stringify(user.chats));

  //TODO: Refactor this in the future
  const newChats = await Promise.all(
    chats.map(async (chat) => {
      chat.lastMessage = await Message.findById(chat.lastMessage).select('-__v');

      const userToRename = chat.user1 != null ? 'user1' : 'user2';
      chat = renameChatUser(chat, userToRename);

      chat.messages = undefined;
      chat.id = undefined;

      return chat;
    })
  );

  res.status(200).json({
    status: 'success',
    results: newChats.length,
    data: {
      chats: newChats,
    },
  });
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const userToPopulate = req.user.id == req.chat.user1 ? 'user2' : 'user1';

  let chat = await req.chat
    .populate({ path: 'messages', select: '-__v' })
    .populate({
      path: userToPopulate,
      select: userChatFields,
    })
    .execPopulate();

  chat = JSON.parse(JSON.stringify(chat));
  chat = renameChatUser(chat, userToPopulate);

  chat.isLive = undefined;
  chat.lastMessage = undefined;
  chat.id = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      chat,
    },
  });
});

const renameChatUser = (chat, userToRename) => {
  chat = renameObjtKey(chat, userToRename, 'user');

  chat.user1 = undefined;
  chat.user2 = undefined;

  return chat;
};
