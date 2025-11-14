// src/routes/review.routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const { createReviewValidation } = require('../middleware/validation');

// @route   POST /api/reviews
router.post('/', auth, createReviewValidation, reviewController.createReview);

module.exports = router;