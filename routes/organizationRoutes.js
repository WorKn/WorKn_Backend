const express = require('express');
const { createOrganization } = require('./../controllers/organizationController');
const { restricTo , protect } = require('./../controllers/authController');

const router = express.Router();

router.post('/createOrganization',protect,restricTo('owner') ,createOrganization);

module.exports = router;