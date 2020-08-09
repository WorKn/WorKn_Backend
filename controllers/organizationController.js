const Organization = require('./../models/organizationModel');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const nodemailer = require('nodemailer');


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

exports.sendOrganizationJoinRequest = catchAsync(async(req, res,next) => {
    
    const orgUserEmail = [];
    if(req.user.organization != req.params.id){
        return next(
            new AppError("Usted no pertenece a esta organización, no puede agregar miembros.",401));
    }

    const org = await Organization.findById(req.params.id);
    org.members.forEach( async(memb) => {      
        orgUserEmail.push(await User.findById(memb).email);
    });


    req.body.members.forEach(async(element) => {
        if(!orgUserEmail.includes(element)){

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'soporte.worknrd@gmail.com',
                pass: 'worknrd0608'
                }
            });
            /*
            const joinReq = MemberInvitation.create();
            token = joinReq.createToken();

            joinReq.Token = crypto.createHash('sha256').update(token).digest('hex');
            //120 min
            joinReq.ExpireDate = Date.now() + 120 * 60 * 1000;
            */
            const newJoinLink = `${req.protocol}://${req.get(
                'host'
              )}/api/v1/users/signup/${org.id}`;
            var mailOptions = {
                from: 'soporte.worknrd@gmail.com',
                to: element,
                subject: `Fuiste invitado a ${org.name} en WorKn`,
                text: `Has sido invitado a ${org.name} en Workn, si deseas unierte accede a ${newJoinLink}, de lo contrario, por favor, ignore este correo `
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email sent: ' + info.response);
                }
            });
        }
    });

    res.status(201).json({
        status: 'success',
        data: {
            message: "email sent to"
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

        /*
        req.body.members.forEach(async(element) => {
            if(!originOrg.members.includes(element)){
                originOrg.members.push(element);
            }
        });
        */
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
