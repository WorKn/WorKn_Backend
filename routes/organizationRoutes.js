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
<<<<<<< HEAD
    .get(protect, getOrganization);
=======
    .get(protect, restricTo ,getOrganization);
>>>>>>> feature/WB-29

router
    .route('/:id/members')
    .get(protect, restricTo('owner','supervisor','member') , viewOrganizationMember);

router
    .route('/:id/members/add')
    .post(protect, restricTo('owner','supervisor') , addOrganizationMember);
router
<<<<<<< HEAD
    .route('/:id/members/remove/:target')
=======
    .route('/:id/members/remove:target')
>>>>>>> feature/WB-29
    .post(protect, restricTo('owner','supervisor','') , removeOrganizationMember);   


module.exports = router;