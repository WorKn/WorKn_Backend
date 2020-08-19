const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const MemberInvitation = require('../models/memberInvitationModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const filterObj = require('./../utils/filterObj');
const crypto = require('crypto');
const factory = require('./handlerFactory');

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
  });
  const owner = await User.findById(req.user.id);
  owner.organization = organization._id;
  await owner.save({ validateBeforeSave: false });

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

exports.getOrganization = factory.getOne(Organization);

exports.getAllOrganizations = factory.getAll(Organization);

exports.sendInvitationEmail = catchAsync(async(req, res,next) => {
  const orgUserEmail = [];
  if(req.user.organization != req.params.id){
    return next(
      new AppError("Usted no pertenece a esta organización, no puede agregar miembros.",401));
  }

  const org = await Organization.findById(req.user.organization);
  org.members.forEach( async(memb) => {      
    orgUserEmail.push(await User.findById(memb).email);
  });
 
  req.body.members.forEach(async(uEmail) => {
    if(!orgUserEmail.includes(uEmail)){

      let enEmail = crypto.createHash('sha256').update(uEmail).digest('hex'); 

      var inv = await MemberInvitation.findOne({ 
        organization: org.id, email: enEmail });

      const invitationToken = crypto.randomBytes(32).toString('hex'); // create

      var inv = await MemberInvitation.create({
        organization: org.id,
        email: uEmail,
        token: invitationToken,
        invitedRole: "member"
      });

      const newJoinLink = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/signup/${org.id}/${invitationToken}`; // this will change

      let message = `Has sido invitado a ${org.name} en WorKn, si deseas unirte accede a ${newJoinLink}, de lo contrario, por favor, ignore este correo.`;

      try {
        await sendEmail({      
          email: uEmail,
          subject: `Fuiste invitado a ${org.name} en WorKn`,
          message,
        });
      } catch (error) {
        return next(
          new AppError(
            'Se ha producido un error tratando de enviar el email de invitación. Por favor, inténtelo de nuevo más tarde.',
            500
          )
        );
      }; 
    };
  });
  res.status(200).json({
    status: 'success',
    data: {
      message: "Email sent"
    },
  });
});
    
  
