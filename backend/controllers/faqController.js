/**
 * FAQ Controller
 * Handles the business logic for FAQ-related requests
 */

const faqModel = require('../models/faqModel');

const getValidatedFaqPayload = (body) => {
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';

    if (!question || !answer || !category) {
        return {
            error: 'question, answer, and category are required'
        };
    }

    return { question, answer, category };
};

/**
 * Get all FAQs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFaqs = async (req, res) => {
    try {
        // Fetch all FAQs from the database
        const faqs = await faqModel.getAllFaqs();
        
        // Send successful response
        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        // Log error and send error response
        console.error('Error fetching FAQs:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FAQs',
            error: error.message
        });
    }
};

/**
 * Create a new FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFaq = async (req, res) => {
    try {
        const payload = getValidatedFaqPayload(req.body);
        if (payload.error) {
            return res.status(400).json({
                success: false,
                message: payload.error
            });
        }

        const newFaq = await faqModel.createFaq(payload.question, payload.answer, payload.category);

        return res.status(201).json({
            success: true,
            data: newFaq
        });
    } catch (error) {
        console.error('Error creating FAQ:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to create FAQ',
            error: error.message
        });
    }
};

/**
 * Update an existing FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFaq = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: 'id must be a valid integer'
            });
        }

        const payload = getValidatedFaqPayload(req.body);
        if (payload.error) {
            return res.status(400).json({
                success: false,
                message: payload.error
            });
        }

        const updatedFaq = await faqModel.updateFaq(id, payload.question, payload.answer, payload.category);
        if (!updatedFaq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedFaq
        });
    } catch (error) {
        console.error('Error updating FAQ:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update FAQ',
            error: error.message
        });
    }
};

/**
 * Delete an FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFaq = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: 'id must be a valid integer'
            });
        }

        const deletedCount = await faqModel.deleteFaq(id);
        if (deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete FAQ',
            error: error.message
        });
    }
};

module.exports = {
    getFaqs,
    createFaq,
    updateFaq,
    deleteFaq
};
