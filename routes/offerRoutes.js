const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
  deleteOffer,
} = require('../controllers/offerController');
const {
  restricTo,
  protect,
  verifyEmailValidation,
} = require('./../controllers/authController');

const interactionRouter = require('./../routes/interactionRoutes');
const router = express.Router();

router.use('/interactions', interactionRouter);

router.get('/', getAllOffers);
router.get('/:id', getOffer);

//Protected routes
router.use(protect, restricTo('offerer'), verifyEmailValidation);

router.post('/', createOffer);

router.route('/:id').patch(protectOffer, editOffer).delete(protectOffer, deleteOffer);

module.exports = router;
