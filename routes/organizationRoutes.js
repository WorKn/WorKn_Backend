const express = require('express');
const {
  createOrganization,
  getAllOrganizations,
} = require('./../controllers/organizationController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllOrganizations)
  .post(protect, restricTo('owner'), createOrganization);

module.exports = router;
