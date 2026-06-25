/**
 * Log Model
 * Handles all database queries related to chat logs and feedback
 */

const pool = require('../config/db');

/**
 * Create a new chat log entry
 * @param {string} userMessage - The user's message
 * @param {string} botReply - The bot's reply
 * @returns {Promise<number>} The ID of the newly created log
 */
async function createLog(userMessage, botReply) {
    const query = `
        INSERT INTO chat_logs (user_message, bot_reply)
        VALUES ($1, $2)
        RETURNING id
    `;
    
    const values = [userMessage, botReply];
    const result = await pool.query(query, values);
    
    return result.rows[0].id;
}

/**
 * Update feedback for a chat log
 * @param {number} logId - The ID of the log to update
 * @param {string} feedback - The feedback value ('up' or 'down')
 * @returns {Promise<void>}
 */
async function updateFeedback(logId, feedback) {
    const query = `
        UPDATE chat_logs
        SET feedback = $1
        WHERE id = $2
    `;
    
    const values = [feedback, logId];
    await pool.query(query, values);
}

/**
 * Get all logs (optional - for analytics)
 * @returns {Promise<Array>} Array of all chat logs
 */
async function getAllLogs() {
    const query = 'SELECT * FROM chat_logs ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Get feedback statistics (optional - for analytics)
 * @returns {Promise<Object>} Feedback statistics
 */
async function getFeedbackStats() {
    const query = `
        SELECT
            COUNT(*) as total_logs,
            COUNT(CASE WHEN feedback = 'up' THEN 1 END) as positive,
            COUNT(CASE WHEN feedback = 'down' THEN 1 END) as negative,
            COUNT(CASE WHEN feedback IS NULL THEN 1 END) as no_feedback
        FROM chat_logs
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
}

module.exports = {
    createLog,
    updateFeedback,
    getAllLogs,
    getFeedbackStats
};
