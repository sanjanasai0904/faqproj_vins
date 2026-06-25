/**
 * FAQ Controller
 * Handles the business logic for FAQ-related requests
 */

const faqModel = require('../models/faqModel');

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

module.exports = {
    getFaqs
};
