const express = require('express');
const {
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  createReview,
  protectReview,
  validateCreateReview,
  setUsersIds,
} = require('./../controllers/reviewController');
const { protect } = require('./../controllers/authController');

//By default each router only has access to the parameters of their specific routes.
//So we set the mergeParams true to also have access to the params that comes from
//the userRouter
const router = express.Router({ mergeParams: true });

router.get('/', getAllReviews);
router.get('/:id', getReview);

//Protected routes
router.use(protect);

router.post('/', validateCreateReview, setUsersIds, createReview);

router.use('/:id', protectReview);

router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;
