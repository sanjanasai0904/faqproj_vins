/**
 * Main Server File
 * Initializes Express app, middleware, and routes
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const faqRoutes = require('./routes/faqRoutes');
const chatRoutes = require('./routes/chatRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const faqFeedbackRoutes = require('./routes/faqFeedbackRoutes');
const faqFeedbackModel = require('./models/faqFeedbackModel');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use('/api', faqRoutes);
app.use('/api', chatRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', faqFeedbackRoutes);

// Auto-create faq_feedback table if it doesn't exist
faqFeedbackModel.createTableIfNotExists()
    .then(() => console.log('✅ faq_feedback table ready'))
    .catch(err => console.error('❌ faq_feedback table init failed:', err.message));

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'FAQ Chatbot API is running',
        status: 'healthy'
    });
});

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
