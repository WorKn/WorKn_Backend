const express = require('express');
const { createOrganization } = require('./../controllers/organizationController');
const { restrictecTo } = require('./../controllers/authController');

const router = express.Router();

router.post('/createOrganization', ,createOrganization);

module.exports = router;