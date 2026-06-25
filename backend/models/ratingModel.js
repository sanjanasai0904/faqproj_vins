/**
 * Rating Model
 * Handles all database queries related to star ratings and semantic deduplication
 */

const pool = require('../config/db');

/**
 * Create a new chat log entry (only called when user submits a rating)
 * @param {string} question - User question
 * @param {string} answer - Bot answer
 * @param {number} rating - Star rating (1-5)
 * @param {string|null} feedbackText - Optional feedback text
 * @returns {Promise<number>} The ID of the created log
 */
async function createChatLog(question, answer, rating, feedbackText = null) {
    const query = `
        INSERT INTO chat_logs (question, answer, rating, feedback_text)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const result = await pool.query(query, [question, answer, rating, feedbackText]);
    return result.rows[0].id;
}

/**
 * Update feedback text for an existing chat log
 * @param {number} logId - Chat log ID
 * @param {string} feedbackText - Feedback text to add
 */
async function updateChatLogFeedback(logId, feedbackText) {
    const query = `
        UPDATE chat_logs
        SET feedback_text = $1
        WHERE id = $2
    `;
    await pool.query(query, [feedbackText, logId]);
}

/**
 * Get a chat log entry by ID
 * @param {number} logId - Chat log ID
 * @returns {Promise<Object|null>} Chat log row or null
 */
async function getChatLogById(logId) {
    const query = `
        SELECT id, question, answer, rating, feedback_text, created_at
        FROM chat_logs
        WHERE id = $1
    `;
    const result = await pool.query(query, [logId]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Add feedback text to a rating summary row.
 * @param {number} summaryId - Rating summary ID
 * @param {number} rating - Star rating tied to the feedback
 * @param {string} feedbackText - Feedback text
 */
async function addFeedbackToRatingSummary(summaryId, rating, feedbackText) {
    const getCurrentQuery = 'SELECT feedback_list FROM faq_rating_summary WHERE id = $1';
    const current = await pool.query(getCurrentQuery, [summaryId]);

    if (current.rows.length === 0) {
        return 0;
    }

    const feedbackList = current.rows[0].feedback_list || [];
    feedbackList.push({
        feedback_text: feedbackText,
        rating: rating,
        created_at: new Date().toISOString()
    });

    const updateQuery = `
        UPDATE faq_rating_summary
        SET feedback_list = $1, updated_at = NOW()
        WHERE id = $2
    `;
    const result = await pool.query(updateQuery, [JSON.stringify(feedbackList), summaryId]);
    return result.rowCount;
}

/**
 * Add feedback to the latest summary row with the same representative question.
 * Used as a compatibility fallback for clients that only send logId.
 * @param {string} question - Chat log question
 * @param {number} rating - Star rating tied to the feedback
 * @param {string} feedbackText - Feedback text
 */
async function addFeedbackToMatchingRatingSummary(question, rating, feedbackText) {
    const matchQuery = `
        SELECT id
        FROM faq_rating_summary
        WHERE representative_question = $1
        ORDER BY updated_at DESC
        LIMIT 1
    `;
    const match = await pool.query(matchQuery, [question]);

    if (match.rows.length === 0) {
        return 0;
    }

    return addFeedbackToRatingSummary(match.rows[0].id, rating, feedbackText);
}

/**
 * Find the most similar question in faq_rating_summary
 * @param {Array<number>} embedding - Question embedding vector
 * @param {number} threshold - Similarity threshold (default 0.50)
 * @returns {Promise<Object|null>} Matching row or null
 */
async function findSimilarQuestion(embedding, threshold = 0.50) {
    try {
        // Convert embedding array to PostgreSQL vector format manually
        const vectorString = `[${embedding.join(',')}]`;
        
        const query = `
            SELECT 
                id, 
                representative_question, 
                ask_count, 
                total_rating_sum,
                average_rating,
                feedback_list,
                1 - (question_embedding <=> $1::vector) AS similarity
            FROM faq_rating_summary
            WHERE question_embedding IS NOT NULL
                AND 1 - (question_embedding <=> $1::vector) >= $2
            ORDER BY question_embedding <=> $1::vector
            LIMIT 1
        `;
        
        const result = await pool.query(query, [vectorString, threshold]);
        return result.rows.length > 0 ? result.rows[0] : null;
        
    } catch (error) {
        // If pgvector is not available, semantic deduplication is disabled
        if (error.message.includes('vector') || error.message.includes('type') || error.message.includes('column')) {
            console.warn('⚠️  Semantic deduplication unavailable (pgvector not installed)');
            return null; // Return no match - creates separate entries
        }
        throw error;
    }
}

/**
 * Update an existing rating summary entry
 * @param {number} id - Summary entry ID
 * @param {number} rating - New rating to add
 * @param {string|null} feedbackText - Optional feedback text
 */
async function updateRatingSummary(id, rating, feedbackText = null) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get current values
        const getCurrentQuery = 'SELECT ask_count, total_rating_sum, feedback_list FROM faq_rating_summary WHERE id = $1';
        const current = await client.query(getCurrentQuery, [id]);
        const row = current.rows[0];
        
        const newAskCount = row.ask_count + 1;
        const newTotalSum = row.total_rating_sum + rating;
        const newAverage = (newTotalSum / newAskCount).toFixed(2);
        
        // Update feedback list if feedback text provided
        let feedbackList = row.feedback_list || [];
        if (feedbackText) {
            feedbackList.push({
                feedback_text: feedbackText,
                rating: rating,
                created_at: new Date().toISOString()
            });
        }
        
        const updateQuery = `
            UPDATE faq_rating_summary
            SET 
                ask_count = $1,
                total_rating_sum = $2,
                average_rating = $3,
                feedback_list = $4,
                updated_at = NOW()
            WHERE id = $5
        `;
        
        await client.query(updateQuery, [newAskCount, newTotalSum, newAverage, JSON.stringify(feedbackList), id]);
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Create a new rating summary entry
 * @param {string} question - Representative question
 * @param {string} answer - Representative answer
 * @param {Array<number>} embedding - Question embedding
 * @param {number} rating - Initial rating
 * @param {string|null} feedbackText - Optional feedback text
 * @returns {Promise<number>} The ID of the created summary
 */
async function createRatingSummary(question, answer, embedding, rating, feedbackText = null) {
    const feedbackList = feedbackText ? [{
        feedback_text: feedbackText,
        rating: rating,
        created_at: new Date().toISOString()
    }] : [];
    
    try {
        // Try to insert with embedding (if pgvector available)
        // Convert embedding array to PostgreSQL vector format manually
        const vectorString = `[${embedding.join(',')}]`;
        
        const query = `
            INSERT INTO faq_rating_summary (
                representative_question,
                representative_answer,
                question_embedding,
                ask_count,
                average_rating,
                total_rating_sum,
                feedback_list
            )
            VALUES ($1, $2, $3::vector, 1, $4, $4, $5)
            RETURNING id
        `;
        
        const result = await pool.query(query, [
            question,
            answer,
            vectorString,
            rating,
            JSON.stringify(feedbackList)
        ]);
        
        return result.rows[0].id;
        
    } catch (error) {
        // If vector column doesn't exist, insert without it
        if (error.message.includes('vector') || error.message.includes('column "question_embedding"')) {
            console.warn('⚠️  Inserting without embedding (pgvector not available)');
            
            const query = `
                INSERT INTO faq_rating_summary (
                    representative_question,
                    representative_answer,
                    ask_count,
                    average_rating,
                    total_rating_sum,
                    feedback_list
                )
                VALUES ($1, $2, 1, $3, $3, $4)
                RETURNING id
            `;
            
            const result = await pool.query(query, [
                question,
                answer,
                rating,
                JSON.stringify(feedbackList)
            ]);
            
            return result.rows[0].id;
        }
        throw error;
    }
}

/**
 * Create a new rating summary entry WITHOUT vector (when pgvector unavailable)
 * @param {string} question - Representative question
 * @param {string} answer - Representative answer
 * @param {number} rating - Initial rating
 * @param {string|null} feedbackText - Optional feedback text
 * @returns {Promise<number>} The ID of the created summary
 */
async function createRatingSummaryWithoutVector(question, answer, rating, feedbackText = null) {
    const feedbackList = feedbackText ? [{
        feedback_text: feedbackText,
        rating: rating,
        created_at: new Date().toISOString()
    }] : [];
    
    const query = `
        INSERT INTO faq_rating_summary (
            representative_question,
            representative_answer,
            ask_count,
            average_rating,
            total_rating_sum,
            feedback_list
        )
        VALUES ($1, $2, 1, $3::numeric, $4, $5)
        RETURNING id
    `;
    
    const result = await pool.query(query, [
        question,
        answer,
        rating,
        rating,
        JSON.stringify(feedbackList)
    ]);
    
    return result.rows[0].id;
}

/**
 * Get all rating summaries ordered by priority score
 * @returns {Promise<Array>} Array of rating summary objects
 */
async function getAllRatingSummaries() {
    const query = `
        SELECT 
            id,
            representative_question,
            representative_answer,
            ask_count,
            average_rating,
            total_rating_sum,
            feedback_list,
            priority_score,
            updated_at
        FROM faq_rating_summary
        ORDER BY priority_score DESC, updated_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Get top N rating summaries that need attention (high priority score)
 * @param {number} limit - Number of rows to return
 * @returns {Promise<Array>} Array of rating summary objects
 */
async function getTopPriorityRatings(limit = 10) {
    const query = `
        SELECT 
            id,
            representative_question,
            representative_answer,
            ask_count,
            average_rating,
            feedback_list,
            priority_score,
            updated_at
        FROM faq_rating_summary
        ORDER BY priority_score DESC, updated_at DESC
        LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
}

module.exports = {
    createChatLog,
    updateChatLogFeedback,
    getChatLogById,
    addFeedbackToRatingSummary,
    addFeedbackToMatchingRatingSummary,
    findSimilarQuestion,
    updateRatingSummary,
    createRatingSummary,
    createRatingSummaryWithoutVector,
    getAllRatingSummaries,
    getTopPriorityRatings
};
