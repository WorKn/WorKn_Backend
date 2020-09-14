const crypto = require('crypto');
const factory = require('./handlerFactory');
const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');
const MemberInvitation = require('../models/memberInvitationModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const filterObj = require('./../utils/filterObj');
const getClientHost = require('./../utils/getClientHost');
const jwt = require('jsonwebtoken');

exports.protectOrganization = catchAsync(async (req, res, next) => {
  if(req.user.userType =="applicant"){
    return next(
      new AppError(
        'Usted no pertenece a esta organización, por favor, contacte con un supervisor o con el dueño de la organización.',
        401
      )
    );
  }
  const org = await Organization.findById(req.user.organization).select('+members');
  if(!org){
    return next(new AppError('No se ha podido encontrar la organización especificada', 404));
  }
  if (!org.members.includes(req.user.id)) {
    return next(
      new AppError(
        'Usted no pertenece a está incluido dentro de la organización, por favor, contacte con un supervisor o con el dueño de la organización.',
        401
      )
    );
  }
  req.organization = org;
  next();
});

exports.createOrganization = catchAsync(async (req, res, next) => {
  if (req.user.organization) {
    return next(new AppError('Usted ya posee una organización asociada.', 400));
  }

  const organization = await Organization.create({
    name: req.body.name,
    RNC: req.body.RNC,
    location: req.body.location,
    phone: req.body.phone,
    email: req.body.email,
    members: [req.user.id],
    bio: req.body.bio,
  });
  const owner = await User.findById(req.user.id);
  owner.organization = organization._id;
  await owner.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'organization created successfully',
    data: {
      organization,
    },
  });
});

exports.editOrganization = catchAsync(async (req, res, next) => {
  if (req.body.members) {
    return next(
      new AppError(
        'No puedes modificar tus miembros aquí, por favor, dirígase al menú de miembros.',
        400
      )
    );
  }

  allowedFields = ['name', 'location', 'phone', 'email'];
  if (req.organization.RNC) {
    allowedFields.push('RNC');
  }
  filteredBody = filterObj(req.body, allowedFields);

  const updatedOrg = await Organization.findByIdAndUpdate(req.organization.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  updatedOrg.save();

  res.status(200).json({
    status: 'success',
    data: {
      organization: updatedOrg,
    },
  });
});

exports.getMyOrganization = catchAsync(async (req, res, next) => {
  req.params.id = req.user.organization;
  next();
});

exports.getOrganization = factory.getOne(Organization);

exports.getAllOrganizations = factory.getAll(Organization);

// Members-----------------

exports.addOrganizationMember = catchAsync(async (req, res, next) => {
  req.organization =  await Organization.findById(req.user.organization).select('+members');
  if (!req.organization.members.includes(req.user.id)) {
    if (req.user.organization != req.organization.id) {
      return next(
        new AppError(
          'El usuario no está registrado con la organización, no se pueden agregar a la misma.',
          403
        )
      );
    }
    req.organization.members.push(req.user);
  }else{
    return next(
      new AppError(
        'Usted ya es un miembro de la aplicación, no se puede volver a agregar.',
        403
      )
    );
  }

  req.organization.save({validateBeforeSave: false});

  res.status(201).json({
    status: 'member added',
    data: {
      user: req.user
    },
  });
});
exports.updateMemberRole = catchAsync(async (req, res, next) => {
  member = await User.findById(req.body.id);
  if (member.organizationRole == 'owner') {
    return next(
      new AppError(
        'Esta no es la vía para cambiar el dueño de la organización, ' +
          'no es posible revocar la posición de dueño desde aquí.',
        401
      )
    );
  }
  if (req.body.organizationRole == 'owner') {
    return next(
      new AppError(
        'Esta no es la vía para cambiar el dueño de la organización, ' +
          'si desea relevar su posición, por favor, diríjase a la nombreDelPageAquí.',
        401
      )
    );
  }

  member.organizationRole = req.body.organizationRole;
  member.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'member updated',
    data: {
      member: member,
    },
  });
});
exports.removeOrganizationMember = catchAsync(async (req, res, next) => {
  const member = await User.findById(req.params.id);
  if(!member){
    return next(new AppError('Este usuario no existe', 400));
  }
  if (!req.organization.members.includes(member.id)) {
    return next(new AppError('Este usuario no pertenece a esta organización', 401));
  }
  if (
    req.user.organizationRole == 'supervisor' &&
    (member.organizationRole == 'owner' || member.organizationRole == 'supervisor')
  ) {
    return next(
      new AppError('Usted solo puede eliminar miembros con rango menor al suyo.', 401)
    );
  }

  if (member.id == req.user.id) {
    return next(
      new AppError('Usted no se puede eliminar a su mismo, mediante esta opción.', 401)
    );
  }

  const index = req.organization.members.indexOf(member.id);
  if (index > -1) {
    req.organization.members.splice(index, 1);
  }

  member.organizationRole = undefined;
  member.organization = undefined;
  member.isActive = false;
  member.email = member.email+Math.random();
  member.save({ validateBeforeSave: false });

  const organization = await Organization.findByIdAndUpdate(req.organization.id, req.organization, {
    new: true,
    runValidators: true,
  }).select('+members');
  organization.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'member deleted',
    data: {
      organization,
    },
  });
});


//Invitations--------------------

exports.sendInvitationEmail = catchAsync(async (req, res, next) => {
  if (!req.body.invitation) {
    return next(
      new AppError(
        'No se ha detectado ningún miembro para invitar, por favor, revise su solicitud.',
        400
      )
    );
  }
  if (req.body.invitation.organizationRole == 'owner') {
    return next(
      new AppError(
        'Se ha detectado el rol owner en la invitation, el proceso será interrumpido.' +
          'por favor, asigne un rol distinto',
        400
      )
    );
  }
  const orgUserEmail = [];
  if (req.organization.members) {
    req.organization.members.forEach(async (memb) => {
      orgUserEmail.push(await User.findById(memb).email);
    });
  }
  if (!orgUserEmail.includes(req.body.invitation.email)) {
    let encryptedEmail = crypto
      .createHash('sha256')
      .update(req.body.invitation.email)
      .digest('hex');

    await MemberInvitation.deleteOne({
      organization: req.organization.id,
      email: encryptedEmail,
    });
    const invitationToken = crypto.randomBytes(32).toString('hex'); // create

    await MemberInvitation.create({
      organization: req.organization.id,
      email: req.body.invitation.email, // this can fail, mongoose error
      token: invitationToken,
      invitedRole: req.body.invitation.role, //This can fail, mongoose error
    });

    const invitationLink = `${getClientHost(req)}/addMember/${invitationToken}`; // this will change

    let message = `Has sido invitado a ${req.organization.name} en WorKn, si deseas unirte accede a ${invitationLink}, de lo contrario, por favor, ignore este correo.`;
    try {
      await sendEmail({
        email: req.body.invitation.email,
        subject: `Fuiste invitado a ${req.organization.name} en WorKn`,
        message,
      });
    } catch (error) {
      return next(
        new AppError(
          'Se ha producido un error tratando de enviar el email de invitación. Por favor, inténtelo de nuevo más tarde.',
          500
        )
      );
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Invitation sent',
    },
  });
});


exports.validateMemberInvitation = catchAsync(async (req, res, next) => {
  encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  var invitation = await MemberInvitation.findOne({
    token: encryptedToken,
  });
  if (invitation && invitation.expirationDate > Date.now()) {
    req.invitedRole = invitation.invitedRole;
    req.invitedEmail = invitation.email;
    req.organization = await Organization.findById(invitation.organization);
    return next();
  }
  return next(new AppError('Token inválido, acceso denegado.', 403));
});

exports.getInvitationInfo = catchAsync(async(req,res,next)=>{
  res.status(200).json({
    status: 'success',
    data: {
      message: "access authorized",
      organization: req.organization,
      email: req.invitedEmail,
      invitedRole: req.invitedRole
    },
  });
})

exports.deleteInvitation=catchAsync(async(req,res,next)=>{
  let encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  await MemberInvitation.deleteOne({
    token: encryptedToken,
  });
  console.log(`The invitation to ${req.user.email} was deleted`);
  next();
})

// Register------------------

exports.signupOrganizationMember = catchAsync(async (req, res, next) => {

  try{
    const newUser = await User.create({
      name: req.body.name,
      lastname: req.body.lastname,
      email: req.invitedEmail,
      birthday: req.body.birthday,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      userType: 'offerer',
      organizationRole: req.invitedRole,
      organization: req.organization.id,
    });
    
    await newUser.save({ validateBeforeSave: false });
    createSendToken(newUser, res);

    newUser.sendValidationEmail(req);

    req.user = newUser;
    next();
  }catch(err){
    await User.deleteOne({email: req.invitedEmail});
    return next(new AppError('Algo salió mal al crear su cuenta, por favor, intente de nuevo',500))
  }
  
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // Converting from days to miliseconds)
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    cookieOptions.secure = false; //Remember change this to true when Https be available
  }

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
};

