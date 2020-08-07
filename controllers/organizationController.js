const Organization = require('./../models/organizationModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.createOrganization = catchAsync(async (req, res, next) => {
    
    const organization = await Organization.create({
      name: req.body.name,
      email: req.body.email,
      birthday: req.body.birthday,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      userType: req.body.userType,
      organizationRole: req.body.organizationRole,
      organization: req.body.organization,
    });
  
    createSendToken(newUser, 201, res);
});