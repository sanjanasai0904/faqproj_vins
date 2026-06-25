/**
 * Feedback Controller
 * Handles star rating submission with semantic deduplication
 */

const ratingModel = require('../models/ratingModel');
const geminiService = require('../services/geminiService');
const pool = require('../config/db');

/**
 * Submit star rating with optional feedback text
 * Implements semantic deduplication using embeddings
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitRating(req, res) {
    try {
        const { question, answer, rating, feedbackText } = req.body;
        
        // Validate inputs
        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'question is required and must be a string'
            });
        }
        
        if (!answer || typeof answer !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'answer is required and must be a string'
            });
        }
        
        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'rating must be an integer between 1 and 5'
            });
        }
        
        console.log(`⭐ Received rating: ${rating} stars for question: "${question.substring(0, 50)}..."`);
        
        // Step 1: Insert into chat_logs (raw audit trail)
        const logId = await ratingModel.createChatLog(question, answer, rating, feedbackText);
        console.log(`📝 Created chat log with ID: ${logId}`);
        
        // Step 2: Check if pgvector is available
        let useEmbeddings = false;
        try {
            const extCheck = await pool.query("SELECT * FROM pg_extension WHERE extname = 'vector'");
            useEmbeddings = extCheck.rows.length > 0;
        } catch (err) {
            console.warn('⚠️  Cannot check pgvector availability');
        }
        
        if (!useEmbeddings) {
            // pgvector not available - store without deduplication
            console.log('ℹ️  Storing rating without semantic deduplication (pgvector not installed)');
            
            const summaryId = await ratingModel.createRatingSummaryWithoutVector(
                question,
                answer,
                rating,
                feedbackText
            );
            
            return res.status(201).json({
                success: true,
                message: 'Rating recorded (semantic deduplication unavailable)',
                logId: logId,
                summaryId: summaryId,
                matched: false
            });
        }
        
        // Step 3: Try semantic deduplication with embeddings
        try {
            // Generate embedding for the question
            const embedding = await geminiService.generateEmbedding(question);
            
            // Find similar question in faq_rating_summary (threshold: 0.50)
            const similarEntry = await ratingModel.findSimilarQuestion(embedding, 0.50);
            
            if (similarEntry) {
                // Update existing entry (same question)
                console.log(`🔗 Found similar question (similarity: ${similarEntry.similarity.toFixed(4)})`);
                console.log(`   Representative: "${similarEntry.representative_question.substring(0, 50)}..."`);
                
                await ratingModel.updateRatingSummary(similarEntry.id, rating, feedbackText);
                console.log(`✅ Updated existing rating summary ID: ${similarEntry.id}`);
                
                return res.status(200).json({
                    success: true,
                    message: 'Rating recorded and merged with existing similar question',
                    logId: logId,
                    summaryId: similarEntry.id,
                    matched: true,
                    similarity: parseFloat(similarEntry.similarity.toFixed(4))
                });
            } else {
                // Create new entry (new question)
                console.log(`🆕 No similar question found, creating new summary entry`);
                
                const summaryId = await ratingModel.createRatingSummary(
                    question,
                    answer,
                    embedding,
                    rating,
                    feedbackText
                );
                
                console.log(`✅ Created new rating summary ID: ${summaryId}`);
                
                return res.status(201).json({
                    success: true,
                    message: 'Rating recorded as new question',
                    logId: logId,
                    summaryId: summaryId,
                    matched: false
                });
            }
            
        } catch (embeddingError) {
            // If embedding generation fails, fall back to simple storage (no deduplication)
            console.warn(`⚠️  Embedding generation failed, storing without deduplication:`, embeddingError.message);
            
            const summaryId = await ratingModel.createRatingSummary(
                question,
                answer,
                [], // empty embedding
                rating,
                feedbackText
            );
            
            console.log(`✅ Created rating summary without deduplication ID: ${summaryId}`);
            
            return res.status(201).json({
                success: true,
                message: 'Rating recorded (semantic deduplication unavailable)',
                logId: logId,
                summaryId: summaryId,
                matched: false,
                note: 'Embeddings not available - each question stored separately'
            });
        }
        
    } catch (error) {
        console.error('❌ Error in rating controller:', error.message);
        console.error(error.stack);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to record rating',
            error: error.message
        });
    }
}

/**
 * Update feedback text for an existing rating
 * Used when user adds text feedback after submitting star rating
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateFeedbackText(req, res) {
    try {
        const { logId, feedbackText } = req.body;
        
        if (!logId || !Number.isInteger(logId)) {
            return res.status(400).json({
                success: false,
                message: 'logId is required and must be an integer'
            });
        }
        
        if (!feedbackText || typeof feedbackText !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'feedbackText is required and must be a string'
            });
        }
        
        console.log(`📝 Updating feedback text for log ID: ${logId}`);
        
        await ratingModel.updateChatLogFeedback(logId, feedbackText);
        
        console.log(`✅ Feedback text updated successfully`);
        
        return res.status(200).json({
            success: true,
            message: 'Feedback text updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating feedback text:', error.message);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to update feedback text',
            error: error.message
        });
    }
}

/**
 * Get all rating summaries for admin dashboard
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllRatings(req, res) {
    try {
        const summaries = await ratingModel.getAllRatingSummaries();
        
        return res.status(200).json({
            success: true,
            count: summaries.length,
            data: summaries
        });
        
    } catch (error) {
        console.error('❌ Error fetching rating summaries:', error.message);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rating summaries',
            error: error.message
        });
    }
}

/**
 * Get top priority ratings (needs attention)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTopPriorityRatings(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const priorities = await ratingModel.getTopPriorityRatings(limit);
        
        return res.status(200).json({
            success: true,
            count: priorities.length,
            data: priorities
        });
        
    } catch (error) {
        console.error('❌ Error fetching top priority ratings:', error.message);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch top priority ratings',
            error: error.message
        });
    }
}

module.exports = {
    submitRating,
    updateFeedbackText,
    getAllRatings,
    getTopPriorityRatings
};

