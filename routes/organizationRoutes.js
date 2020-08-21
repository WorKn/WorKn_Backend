const express = require('express');
const { 
  createOrganization,
  getAllOrganizations,
  getOrganization,
  editOrganization,
  getMyOrganization,
  sendInvitationEmail,
  addOrganizationMember,
  validateMemberInvitation,
  updateMemberRole,
  removeOrganizationMember
} = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/myOrganization', protect, getMyOrganization, getOrganization);
router.get('/:id', getOrganization);

router
  .route('/:id/:token')
  .get(protect,validateMemberInvitation,getOrganization); 

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
  .post(restricTo("supervisor","owner"),updateMemberRole)
  .delete(restricTo("supervisor","owner"),removeOrganizationMember);
  
router
  .route('/:id/members/add')
  .post(restricTo("supervisor","owner"),addOrganizationMember);

module.exports = router;