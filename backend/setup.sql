-- Setup script for FAQ Chatbot Database
-- Run this FIRST before running the schema.sql

-- Create the database (run this as postgres user)
CREATE DATABASE faq_chatbot;

-- Connect to the database
\c faq_chatbot;

-- Verify connection
SELECT 'Database faq_chatbot created and connected successfully!' AS status;
