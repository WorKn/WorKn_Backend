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

router.get('/', getAllOrganizations);
router.get('/:id', getOrganization);

router
  .route('/:id/members')
  .get(protect,restricTo("owner","supervisor","member"),getOrganization);

router
  .route('/:id/members/invite')
  .post(protect, restricTo("owner", "supervisor"),sendInvitationEmail);

//Protected routes
router.use(protect, restricTo('owner'));

router.post('/', createOrganization);
router.post('/:id', editOrganization);


module.exports = router;
