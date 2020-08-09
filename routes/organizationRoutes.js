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
    .get(protect, restricTo ,getOrganization);

router
    .route('/:id/members')
    .get(protect, restricTo('owner','supervisor','member') , viewOrganizationMember);

router
    .route('/:id/members/add')
    .post(protect, restricTo('owner','supervisor') , addOrganizationMember);
router
    .route('/:id/members/remove:target')
    .post(protect, restricTo('owner','supervisor','') , removeOrganizationMember);   


module.exports = router;