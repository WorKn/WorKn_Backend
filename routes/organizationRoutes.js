const express = require('express');
const { createOrganization,getAllOrganizations } = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router.post('/createOrganization' , protect, restricTo('owner') ,createOrganization);

router.get('/', getAllOrganizations)

module.exports = router;