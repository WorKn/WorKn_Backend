const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');

const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const filterObj = require('./../utils/filterObj');

const factory = require('./handlerFactory');

exports.createOrganization = catchAsync(async (req, res, next) => {
<<<<<<< HEAD
    
    if(req.user.organization){
        return next(new AppError("Usted ya posee una organización asociada",400));
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
    await owner.save({validateBeforeSave: false});
    if(req.body.members){
        
    }
    res.status(201).json({
        status: 'success',
        data: {
            organization,
        },
    });
    
=======
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
>>>>>>> develop
});
exports.editOrganization = catchAsync(async (req, res, next) => {
  if (req.user.organization != req.params.id) {
    return next(
      new AppError(
        'Usted no pertenece a esta organización, no tiene permisos para editarla',
        401
      )
    );
  }
  if (req.body.members) {
    return next(
      new AppError(
        'No puedes modificar tus miembros aquí, por favor, dirígase al menú de miembros',
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
