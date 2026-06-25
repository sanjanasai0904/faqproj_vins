/**
 * Feedback Routes
 * Defines all routes related to star rating feedback
 */

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST /rating - Submit star rating with optional feedback
router.post('/rating', feedbackController.submitRating);

// PATCH /rating/feedback - Update feedback text for existing rating
router.patch('/rating/feedback', feedbackController.updateFeedbackText);

// GET /admin/ratings - Get all rating summaries (for admin dashboard)
router.get('/admin/ratings', feedbackController.getAllRatings);

// GET /admin/ratings/top - Get top priority ratings
router.get('/admin/ratings/top', feedbackController.getTopPriorityRatings);

module.exports = router;
