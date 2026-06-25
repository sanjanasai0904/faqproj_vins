/**
 * FAQ Model
 * Handles all database queries related to FAQs
 */

const pool = require('../config/db');

/**
 * Get all FAQs from the database
 * @returns {Promise<Array>} Array of FAQ objects
 */
const getAllFaqs = async () => {
    const query = 'SELECT * FROM faqs ORDER BY id';
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getAllFaqs
};
