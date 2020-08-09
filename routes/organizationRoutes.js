const express = require('express');
const { 
    createOrganization,
    addOrganizationMember,
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
    .get(protect, restricTo('owner','supervisor','offerer') ,getOrganization);

router
    .route('/:id/members')
    .post(protect, restricTo('owner','supervisor','offerer','applicant') , viewOrganizationMember);

router
    .route('/:id/members/add')
    .post(protect, restricTo('owner','supervisor','offerer','applicant') , addOrganizationMember);
router
    .route('/:id/members/remove')
    .post(protect, restricTo('owner','supervisor','offerer','applicant') , removeOrganizationMember);   


module.exports = router;