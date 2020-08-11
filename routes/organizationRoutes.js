const express = require('express');
const { 
    createOrganization,
    addOrganizationMember,
    sendInvitationEmail,
    getOrganization,
    viewOrganizationMember,
    removeOrganizationMember

} = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router
    .route('/createOrganization')
    .post(protect, restricTo('owner') ,createOrganization);

router
    .route('/:id')
    .get(protect, getOrganization);

router
    .route('/:id/members')
    .get(protect, restricTo('owner','supervisor','member') , viewOrganizationMember);

router
    .route('/:id/members/invite')
    .post(protect, restricTo('owner','supervisor'), sendInvitationEmail);
    
router
    .route('/:id/members/remove/:target')
    .post(protect, restricTo('owner','supervisor') , removeOrganizationMember);   


module.exports = router;