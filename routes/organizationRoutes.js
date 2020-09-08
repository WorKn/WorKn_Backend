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
  removeOrganizationMember,
  protectOrganization,
  getInvitationInfo,
} = require('./../controllers/organizationController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/myOrganization', protect, getMyOrganization, getOrganization);
router.get('/:id', getOrganization);

//Protected routes
router.use(protect);

router.post('/',restricTo('owner'), protectOrganization, createOrganization);
router.patch('/:id',restricTo('owner'), protectOrganization, editOrganization);
router
  .route('/:id/members/invite')
  .post(restricTo('owner', 'supervisor'), protectOrganization, sendInvitationEmail);

router
  .route('/:id/members')
  .get(restricTo('owner', 'supervisor', 'member'), protectOrganization, getOrganization)
  .post(restricTo('supervisor', 'owner'), protectOrganization, updateMemberRole)
  .delete(restricTo('supervisor', 'owner'), protectOrganization, removeOrganizationMember);

router.route('/:id/members/add').post(restricTo('supervisor', 'owner'),protectOrganization, addOrganizationMember);

router.route('/invitation/:token').get(protectOrganization, validateMemberInvitation, getInvitationInfo);

module.exports = router;
