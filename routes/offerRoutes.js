const express = require('express');
const {
  createOffer,
  getAllOffers,
  getOffer,
  editOffer,
  protectOffer,
  deleteOffer,
  getMyOffers,
  getOfferByTag,
} = require('../controllers/offerController');
const {
  restricTo,
  protect,
  verifyEmailValidation,
} = require('./../controllers/authController');

const interactionRouter = require('./../routes/interactionRoutes');
const router = express.Router();

router.get('/', getOfferByTag);
router.get('/me',protect,verifyEmailValidation,restricTo('offerer'), getMyOffers);
router.use('/interactions', interactionRouter);

router.get('/:id', getOffer);

//Protected routes
router.use(protect, restricTo('offerer'), verifyEmailValidation);

router.post('/', createOffer);

router.route('/:id').patch(protectOffer, editOffer).delete(protectOffer, deleteOffer);

module.exports = router;
