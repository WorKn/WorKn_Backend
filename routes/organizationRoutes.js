const express = require('express');
const { 
  createOrganization,
  getAllOrganizations,
  getOrganization,
  editOrganization,
  getMyOrganization,
  sendInvitationEmail,
  updateMemberRole,
  addOrganizationMember
} = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/myOrganization', protect, getMyOrganization, getOrganization);
router.get('/:id', getOrganization);

//Protected routes
router.use(protect, restricTo('owner'));

router.post('/', createOrganization);
router.post('/:id', editOrganization);
router
  .route('/:id/members/invite')
  .post(restricTo("owner", "supervisor"),sendInvitationEmail);
router
  .route('/:id/members')
  .get(restricTo("owner","supervisor","member"),getOrganization)
  .post(restricTo("supervisor","owner"),updateMemberRole);
  
router
  .route('/:id/members/add')
  .post(restricTo("supervisor","owner"),addOrganizationMember);

module.exports = router;