const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const MemberInvitation = require('../models/memberInvitationModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const filterObj = require('./../utils/filterObj');
const crypto = require('crypto');
const factory = require('./handlerFactory');


sendInviteEmail = async(organization,members,req,next) => {
  const orgUserEmail = [];
  organization.members.forEach( async(memb) => {      
    orgUserEmail.push(await User.findById(memb).email);
  });
  members.forEach(async(invitedEmail) => {
    if(!orgUserEmail.includes(invitedEmail)){
      let encryptedEmail = crypto.createHash('sha256').update(invitedEmail).digest('hex'); 

      var invitation = await MemberInvitation.deleteOne({ 
        organization: organization.id, email: encryptedEmail });

      const invitationToken = crypto.randomBytes(32).toString('hex'); // create

      var invitation = await MemberInvitation.create({
        organization: organization.id,
        email: invitedEmail,
        token: invitationToken,
        invitedRole: "member"
      });

      const invitationLink = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/signup/${organization.id}/${invitationToken}`; // this will change

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
      }; 
    };
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
  });
  const owner = await User.findById(req.user.id);
  owner.organization = organization._id;
  await owner.save({ validateBeforeSave: false });
  
  if(req.body.members){
    sendInviteEmail(organization,req.body.members,req,next);
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

exports.getOrganization = factory.getOne(Organization);

exports.getAllOrganizations = factory.getAll(Organization);

exports.updateMemberRole = catchAsync(async(req,res,next)=>{
  if(req.user.organization != req.params.id){
    return next(
      new AppError("Usted no pertenece a esta organización, no puede modificar los miembros.",401));
  }
  allowedFields = ['organizationRole'];
  filteredBody = filterObj(req.body, allowedFields);

  const updatedMember = await User.findByIdAndUpdate(req.body.member.id, filteredBody, {
    new: true,
    runValidators: true
  });

  updatedMember.save({validateBeforeSave: false});

  res.status(200).json({
    status: 'success',
    data: {
      organization: updatedMember,
    },
  });
});

exports.sendInvitationEmail = catchAsync(async(req, res,next) => {
  if(req.user.organization != req.params.id){
    return next(
      new AppError("Usted no pertenece a esta organización, no puede agregar miembros.",401));
  }
  const org = await Organization.findById(req.user.organization);
  sendInviteEmail(org,req.body.members,req,next)

  res.status(200).json({
    status: 'success',
    data: {
      message: "Email sent"
    },
  });
});
    
  
