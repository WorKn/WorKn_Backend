const express = require('express');
const {
  createOrganization,
  getAllOrganizations,
  getOrganization,
  editOrganization,
} = require('./../controllers/organizationController');
const { restricTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.get('/', getAllOrganizations);
router.get('/:id', getOrganization);

//Protected routes
router.use(protect, restricTo('owner'));

router.post('/', createOrganization);
router.post('/:id', editOrganization);

module.exports = router;
