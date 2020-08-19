const express = require('express');
const { 
  createOrganization,
  getAllOrganizations,
  getOrganization,
  editOrganization,
  sendInvitationEmail
} = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllOrganizations)
  .post(protect, restricTo('owner'), createOrganization);

router
    .route('/:id')
    .get(getOrganization)
    .patch(protect,restricTo("owner"),editOrganization);

router
  .route('/:id/members')
  .get(protect,restricTo("owner,supervisor,member"),getOrganization);

router
  .route('/:id/members/invite')
  .post(protect, restricTo('owner','supervisor'),sendInvitationEmail);

module.exports = router;
