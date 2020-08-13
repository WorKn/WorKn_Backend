const express = require('express');
const { createOrganization
  ,getAllOrganizations
  ,getOrganization
  ,editOrganization } = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router.post('/createOrganization' , protect, restricTo('owner') ,createOrganization);

router
    .route('/:id')
    .get(getOrganization);

router
  .route('/')
  .get(getAllOrganizations)
  .post(protect,restricTo("owner"),editOrganization);

module.exports = router;