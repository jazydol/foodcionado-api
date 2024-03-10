const express = require('express');
const tourController = require('../Controllers/TourController');
const authController = require('../Controllers/AuthenticationController');

const router = express.Router();

router.route('/top-5-cheap').get(tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'modirator'),
    tourController.deleteTour
  );

module.exports = router;
