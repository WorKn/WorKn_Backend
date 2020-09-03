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

sendInviteEmail = async (organization, members, req, next) => {
  const orgUserEmail = [];
  try {
    organization.members.forEach(async (memb) => {
      orgUserEmail.push(await User.findById(memb).email);
    });
  } catch {}
  
  members.forEach(async (invitedEmail) => {
    if (!orgUserEmail.includes(invitedEmail)) {
      let encryptedEmail = crypto.createHash('sha256').update(invitedEmail).digest('hex');

      var invitation = await MemberInvitation.deleteOne({
        organization: organization.id,
        email: encryptedEmail,
      });
      const invitationToken = crypto.randomBytes(32).toString('hex'); // create

      var invitation = await MemberInvitation.create({
        organization: organization.id,
        email: invitedEmail,
        token: invitationToken,
        invitedRole: 'member',
      });

      const invitationLink = `${getClientHost(req)}/${organization.id}/${invitationToken}`; // this will change

      let message = `Has sido invitado a ${organization.name} en WorKn, si deseas unirte accede a ${invitationLink}, de lo contrario, por favor, ignore este correo.`;
      try {
        await sendEmail({
          email: invitedEmail,
          subject: `Fuiste invitado a ${organization.name} en WorKn`,
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
  });
};
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

  if (req.body.members) {
    sendInviteEmail(organization, req.body.members, req, next);
  }

  res.status(201).json({
    status: 'success',
    data: {
      organization,
    },
  });
});

exports.editOrganization = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError(
        'Usted no pertenece a esta organización, no tiene permisos para editarla.',
        401
      )
    );
  }
  if (req.body.members) {
    return next(
      new AppError(
        'No puedes modificar tus miembros aquí, por favor, dirígase al menú de miembros.',
        400
      )
    );
  }

  allowedFields = ['name', 'location', 'phone', 'email'];

  org = await Organization.findById(req.params.id);
  if (!org) {
    return next(new AppError('No se ha podido encontrar la organización especificada.', 404));
  }

  if (!org.RNC) {
    allowedFields.push('RNC');
  }
  filteredBody = filterObj(req.body, allowedFields);

  const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, filteredBody, {
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

exports.addOrganizationMember = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError('Usted no pertenece a esta organización, no puede agregar miembros.', 401)
    );
  }
  const originOrg = await Organization.findById(req.params.id).select('+members');

  for (member of req.body.members) {
    if (!originOrg.members.includes(member)) {
      potentialMember = await User.findById(member);
      if (potentialMember.organization != req.params.id) {
        return next(
          new AppError(
            'Uno o más usuarios no están registrados con la organización, no se pueden agregar a la misma',
            401
          )
        );
      }
      await originOrg.members.push(member);
    }
  }

  const organization = await Organization.findByIdAndUpdate(req.params.id, originOrg, {
    new: true,
    runValidators: true,
  }).select('+members');

  res.status(201).json({
    status: 'members added',
    data: {
      organization,
    },
  });
});

exports.getOrganization = factory.getOne(Organization);

exports.getAllOrganizations = factory.getAll(Organization);

exports.validateMemberInvitation = catchAsync(async (req, res, next) => {
  encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  var invitation = await MemberInvitation.findOne({
    token: encryptedToken,
  });
  if (invitation && invitation.expirationDate > Date.now()) {
    return next();
  }
  return next(new AppError('Token inválido, acceso denegado.', 403));
});

exports.updateMemberRole = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError(
        'Usted no pertenece a esta organización, no puede modificar los miembros.',
        401
      )
    );
  }

  member = await User.findById(req.body.member.id);
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
          'no es posible convertir un miembro de la organización en dueño desde aquí.',
        401
      )
    );
  }

  member.organizationRole = req.body.organizationRole;
  member.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      organization: member,
    },
  });
});

exports.removeOrganizationMember = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError('Usted no pertenece a esta organización, no puede agregar miembros.', 401)
    );
  }
  const member = await User.findById(req.body.id);
  const originOrg = await Organization.findById(req.params.id).select('+members');
  if (!originOrg.members.includes(member.id)) {
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

  if (member == req.user) {
    return next(
      new AppError('Usted no se puede eliminar a su mismo, mediante esta opción.', 401)
    );
  }

  const index = originOrg.members.indexOf(member.id);
  if (index > -1) {
    originOrg.members.splice(index, 1);
  }

  member.organizationRole = undefined;
  member.organization = undefined;
  member.isActive = false;
  member.email = undefined;
  member.save({ validateBeforeSave: false });

  const organization = await Organization.findByIdAndUpdate(req.params.id, originOrg, {
    new: true,
    runValidators: true,
  }).select('+members');
  organization.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: {
      organization,
    },
  });
});

exports.sendInvitationEmail = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError('Usted no pertenece a esta organización, no puede agregar miembros.', 401)
    );

  if(!req.body.members.forEach){
    return next(
      new AppError(
        'No se ha detectado ningún miembro para invitar, por favor, revise su solicitud.',
        400
      )
    );
  }
  const org = await Organization.findById(req.user.organization);
  sendInviteEmail(org, req.body.members, req, next);

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Email sent',
    },
  });
});
