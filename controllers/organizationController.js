const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

function mergeArrays(...arrays) {
    let jointArray = []
    arrays.forEach(array => {
        jointArray = [...jointArray, ...array]
    })
    console.log(arrays);
    const uniqueArray = jointArray.reduce((newArray, item) =>{
        if (newArray.includes(String(item))){
            return newArray
        } else {
            return [...newArray, item]
        }
    }, [])
    console.log(uniqueArray);
    return uniqueArray
}

exports.createOrganization = catchAsync(async (req, res, next) => {
    try {
        if(req.user.organization){
            return next(new AppError("Usted ya posee una organización asociada.",400));
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
    
        res.status(201).json({
            status: 'success',
            data: {
                organization,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
    
});

exports.getOrganization = catchAsync(async (req, res, next) =>{

    const organization = await Organization.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            organization,
        },
    });

});

exports.addOrganizationMember = catchAsync(async (req, res, next) => {
        
    try {
        if(req.user.organization != req.params.id){
            return next(
                new AppError("Usted no pertenece a esta organización, no puede agregar miembros.",401));
        }
        const originOrg = await Organization.findById(req.params.id);
        req.body.members.forEach(async(element) => {
            if(!originOrg.members.includes(element)){
                originOrg.members.push(element);
                const member = await User.findById(element);
                member.organizationRole="member";
                const nMember = await User.findByIdAndUpdate(element,member, {                    
                    new: true
                });
            }
        });
        const organization = await Organization.findByIdAndUpdate(req.params.id,originOrg, {
            new: true,
            runValidators: true
        });

    
        res.status(201).json({
            status: 'success',
            data: {
                organization,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }  
});

exports.viewOrganizationMember = catchAsync(async (req, res, next) => {

});

exports.removeOrganizationMember = catchAsync(async (req, res, next) => {

});
