/**
 * FAQ Feedback Routes
 * Thumbs up/down feedback for static FAQ answers.
 */

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/faqFeedbackController');

// --- Public (user-facing) ---
// POST /api/faq-feedback          — submit a thumbs up or down
router.post('/faq-feedback', ctrl.submitFeedback);

// --- Admin ---
// GET    /api/admin/faq-feedback              — list all feedback rows
router.get('/admin/faq-feedback', ctrl.getAllFeedback);

// DELETE /api/admin/faq-feedback/:id          — delete entire FAQ's feedback row
router.delete('/admin/faq-feedback/:id', ctrl.deleteFeedbackRow);

// DELETE /api/admin/faq-feedback/:id/entries/:idx — remove single entry from JSONB array
router.delete('/admin/faq-feedback/:id/entries/:idx', ctrl.deleteFeedbackEntry);

// PATCH  /api/admin/faq-feedback/:faqId/answer — edit FAQ answer from admin
router.patch('/admin/faq-feedback/:faqId/answer', ctrl.updateFaqAnswer);

module.exports = router;
