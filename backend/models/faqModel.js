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

/**
 * Create a new FAQ
 * @param {string} question - FAQ question
 * @param {string} answer - FAQ answer
 * @param {string} category - FAQ category
 * @returns {Promise<Object>} Created FAQ row
 */
const createFaq = async (question, answer, category) => {
    const query = `
        INSERT INTO faqs (question, answer, category)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await pool.query(query, [question, answer, category]);
    return result.rows[0];
};

/**
 * Update an existing FAQ
 * @param {number} id - FAQ ID
 * @param {string} question - FAQ question
 * @param {string} answer - FAQ answer
 * @param {string} category - FAQ category
 * @returns {Promise<Object|undefined>} Updated FAQ row
 */
const updateFaq = async (id, question, answer, category) => {
    const query = `
        UPDATE faqs
        SET question = $1, answer = $2, category = $3
        WHERE id = $4
        RETURNING *
    `;
    const result = await pool.query(query, [question, answer, category, id]);
    return result.rows[0];
};

/**
 * Delete an FAQ
 * @param {number} id - FAQ ID
 * @returns {Promise<number>} Deleted row count
 */
const deleteFaq = async (id) => {
    const query = 'DELETE FROM faqs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount;
};

module.exports = {
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq
};
