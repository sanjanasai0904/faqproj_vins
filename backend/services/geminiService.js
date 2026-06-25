/**
 * Gemini AI Service
 * Handles all interactions with Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Build FAQ list string for system instruction
 * @param {Array} faqList - Array of FAQ objects
 * @returns {string} Formatted FAQ list
 */
function buildFaqListString(faqList) {
    if (!faqList || faqList.length === 0) {
        return 'No FAQs available.';
    }
    
    return faqList.map(faq => 
        `Category: ${faq.category}\nQ: ${faq.question}\nA: ${faq.answer}\n`
    ).join('\n');
}

/**
 * Build system instruction with FAQ list
 * @param {Array} faqList - Array of FAQ objects
 * @returns {string} Complete system instruction
 */
function buildSystemInstruction(faqList) {
    const faqListString = buildFaqListString(faqList);
    
    return `You are a support assistant for VINS interns. You must answer ONLY using the FAQ list provided below.

Rules:
- If the user's question matches an FAQ (even if worded very differently, with typos, or casually), answer using that FAQ's information, in your own natural phrasing.
- If the question is ambiguous or could match 2+ FAQs, ask ONE short clarifying question before answering. Do not guess.
- If nothing in the FAQ list covers the question, say honestly: "I don't have information on that — you can raise a query for the team." Do not make up an answer.
- Keep answers concise and friendly.
- Use a conversational tone, not robotic.
- You can use emojis occasionally to be friendly.

FAQ LIST:
${faqListString}`;
}

/**
 * Format conversation history for Gemini API
 * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: '...'}
 * @returns {Array} Formatted history for Gemini
 */
function formatConversationHistory(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
        return [];
    }
    
    return conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
}

/**
 * Get chat response from Gemini API
 * @param {Array} faqList - Array of FAQ objects from database
 * @param {Array} conversationHistory - Previous conversation turns
 * @param {string} userMessage - Current user message
 * @returns {Promise<string>} Gemini's response text
 */
async function getChatResponse(faqList, conversationHistory, userMessage) {
    try {
        // Build system instruction with FAQ list
        const systemInstruction = buildSystemInstruction(faqList);
        
        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: systemInstruction
        });
        
        // Format conversation history
        const formattedHistory = formatConversationHistory(conversationHistory);
        
        // Start chat with history
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
            }
        });
        
        // Send user message and get response
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const responseText = response.text();
        
        console.log('✅ Gemini API response received');
        
        return responseText;
        
    } catch (error) {
        console.error('❌ Gemini API error:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('API key')) {
            throw new Error('Invalid or missing Gemini API key');
        } else if (error.message.includes('quota')) {
            throw new Error('Gemini API quota exceeded');
        } else {
            throw new Error('Failed to get response from Gemini API');
        }
    }
}

/**
 * Generate embedding for text using Gemini embedding model (REST API)
 * Uses gemini-embedding-001 with outputDimensionality: 768
 * @param {string} text - The text to generate embedding for
 * @returns {Promise<Array<number>>} The embedding vector (768 dimensions)
 */
async function generateEmbedding(text) {
    try {
        console.log(`🔢 Generating embedding for text: "${text.substring(0, 50)}..."`);
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        
        // Use REST API directly (SDK doesn't support outputDimensionality)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
        
        const requestBody = {
            model: "models/gemini-embedding-001",
            content: {
                parts: [{ text: text }]
            },
            outputDimensionality: 768
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Embedding API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        const embedding = data.embedding.values;
        
        console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
        
        // Verify dimension is exactly 768
        if (embedding.length !== 768) {
            console.warn(`⚠️  Warning: Expected 768 dimensions, got ${embedding.length}`);
        }
        
        return embedding;
        
    } catch (error) {
        console.error('❌ Error generating embedding:', error.message);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}

module.exports = {
    getChatResponse,
    generateEmbedding
};
