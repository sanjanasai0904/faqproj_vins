/**
 * Chat Routes
 * Defines all routes related to chat endpoints
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /chat - Send a chat message and get AI response
router.post('/chat', chatController.handleChat);

module.exports = router;
