/**
 * FAQ Routes
 * Defines all routes related to FAQ endpoints
 */

const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// GET /faqs - Retrieve all FAQs
router.get('/faqs', faqController.getFaqs);

module.exports = router;
