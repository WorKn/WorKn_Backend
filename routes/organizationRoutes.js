const express = require('express');
const { createOrganization } = require('./../controllers/organizationController');
const { restricTo } = require('./../controllers/authController');

const router = express.Router();

router.post('/createOrganization',restricTo('owner') ,createOrganization);

module.exports = router;