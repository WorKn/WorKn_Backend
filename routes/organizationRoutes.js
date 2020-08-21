const express = require('express');
const { 
  createOrganization,
  getAllOrganizations,
  getOrganization,
  editOrganization,
  getMyOrganization,
  sendInvitationEmail,
  validateMemberInvitation
} = require('./../controllers/organizationController');
const { restricTo , protect} = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/myOrganization', protect, getMyOrganization, getOrganization);
router.get('/:id', getOrganization);
  
router
  .route('/:id/:token')
  .get(protect,validateMemberInvitation,getOrganization);

router
  .route('/:id/members/invite')
  .post(protect, restricTo("owner", "supervisor"),sendInvitationEmail);

//Protected routes
router.use(protect, restricTo('owner'));

router.post('/', createOrganization);
router.post('/:id', editOrganization);


module.exports = router;
