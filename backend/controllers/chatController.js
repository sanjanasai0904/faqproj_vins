/**
 * Chat Controller
 * Handles chat request/response logic
 */

const faqModel = require('../models/faqModel');
const geminiService = require('../services/geminiService');

/**
 * Handle chat request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleChat(req, res) {
    try {
        // Extract data from request body
        const { conversationHistory = [], message } = req.body;
        
        // Validate user message
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required and must be a non-empty string'
            });
        }
        
        console.log(`💬 Received chat message: "${message}"`);
        
        // Fetch FAQ list from database
        const faqList = await faqModel.getAllFaqs();
        console.log(`📚 Loaded ${faqList.length} FAQs for context`);
        
        // Get response from Gemini API
        const reply = await geminiService.getChatResponse(
            faqList,
            conversationHistory,
            message
        );
        
        // Build updated conversation history
        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: reply }
        ];
        
        // NOTE: We no longer log every conversation to chat_logs
        // Logging only happens when user submits a star rating via POST /api/rating
        
        // Send successful response
        const response = {
            success: true,
            reply: reply,
            updatedHistory: updatedHistory,
            // Return the question and answer so frontend can submit rating
            question: message,
            answer: reply
        };
        
        res.status(200).json(response);
        
        console.log('✅ Chat response sent successfully (not logged - awaiting rating)');
        
    } catch (error) {
        console.error('❌ Error in chat controller:', error.message);
        
        // Send error response
        res.status(500).json({
            success: false,
            message: 'Failed to process chat request',
            error: error.message
        });
    }
}

module.exports = {
    handleChat
};
