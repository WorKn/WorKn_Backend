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
  signupOrganizationMember,
  deleteInvitation
} = require('./../controllers/organizationController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/myOrganization', protect, getMyOrganization, getOrganization);
router.route('/invitation/:token').get(validateMemberInvitation, getInvitationInfo);
router.post('/members/signup/:token', validateMemberInvitation,signupOrganizationMember,deleteInvitation, addOrganizationMember);

router.get('/:id', getOrganization);

//Protected routes
router.use(protect);

router.post('/',restricTo('owner'), createOrganization);
router.patch('/',restricTo('owner'), protectOrganization, editOrganization);

router
  .route('/members')
  .get(restricTo('owner', 'supervisor', 'member'), protectOrganization, getOrganization)
  .patch(restricTo('supervisor', 'owner'), protectOrganization, updateMemberRole)

router.delete('/members/:id', restricTo('supervisor','owner'), protectOrganization,removeOrganizationMember)

router
  .route('/members/invite')
  .post(restricTo('owner', 'supervisor'), protectOrganization, sendInvitationEmail);

module.exports = router;
