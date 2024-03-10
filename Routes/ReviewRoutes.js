const express = require('express');
const reviewController = require('../Controllers/ReviewController');
const authController = require('../Controllers/AuthenticationController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setReviewUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'modirator', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'modirator', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
