-- Chat Logs Table for Feedback Tracking
-- Stores all chat interactions and user feedback

-- Create the chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    user_message TEXT NOT NULL,
    bot_reply TEXT NOT NULL,
    feedback VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create an index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);

-- Create an index on feedback for analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_logs_feedback ON chat_logs(feedback);

-- Verify table creation
SELECT 'chat_logs table created successfully!' AS status;
