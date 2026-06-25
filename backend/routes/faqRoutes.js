/**
 * FAQ Routes
 * Defines all routes related to FAQ endpoints
 */

const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// GET /faqs - Retrieve all FAQs
router.get('/faqs', faqController.getFaqs);

// POST /faqs - Create a new FAQ
router.post('/faqs', faqController.createFaq);

// PUT /faqs/:id - Update an existing FAQ
router.put('/faqs/:id', faqController.updateFaq);

// DELETE /faqs/:id - Delete an FAQ
router.delete('/faqs/:id', faqController.deleteFaq);

module.exports = router;
