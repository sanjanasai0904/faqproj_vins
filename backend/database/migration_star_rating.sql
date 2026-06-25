-- Migration: Replace thumbs up/down with star rating system + semantic deduplication
-- Author: System
-- Date: 2026-06-24

-- Step 1: Try to enable pgvector extension (skip if not available)
-- Note: If this fails, the system will work but without semantic deduplication
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
    RAISE NOTICE 'pgvector extension enabled successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension not available - semantic deduplication will be disabled';
        RAISE NOTICE 'To enable: Install pgvector for PostgreSQL';
END $$;

-- Step 2: Drop old feedback column from chat_logs if it exists
ALTER TABLE IF EXISTS chat_logs DROP COLUMN IF EXISTS feedback;

-- Step 3: Update chat_logs table structure for star rating
-- Drop and recreate to ensure clean schema
DROP TABLE IF EXISTS chat_logs CASCADE;

CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create new faq_rating_summary table for semantic deduplication
-- This will only work if pgvector is available
DROP TABLE IF EXISTS faq_rating_summary CASCADE;

-- Try to create table with vector column
DO $$
BEGIN
    EXECUTE '
    CREATE TABLE faq_rating_summary (
        id SERIAL PRIMARY KEY,
        representative_question TEXT NOT NULL,
        representative_answer TEXT,
        question_embedding VECTOR(768),
        ask_count INTEGER NOT NULL DEFAULT 1,
        average_rating NUMERIC(3,2) NOT NULL,
        total_rating_sum INTEGER NOT NULL,
        feedback_list JSONB DEFAULT ''[]'',
        priority_score NUMERIC GENERATED ALWAYS AS (ask_count * (6 - average_rating)) STORED,
        updated_at TIMESTAMP DEFAULT NOW()
    )';
    
    RAISE NOTICE 'faq_rating_summary table created with vector support';
    
    -- Step 5: Create HNSW index for fast similarity search
    EXECUTE 'CREATE INDEX ON faq_rating_summary USING hnsw (question_embedding vector_cosine_ops)';
    RAISE NOTICE 'HNSW index created successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        -- If vector type fails, create table without it (no semantic deduplication)
        RAISE NOTICE 'Creating faq_rating_summary without vector support';
        
        CREATE TABLE IF NOT EXISTS faq_rating_summary (
            id SERIAL PRIMARY KEY,
            representative_question TEXT NOT NULL,
            representative_answer TEXT,
            ask_count INTEGER NOT NULL DEFAULT 1,
            average_rating NUMERIC(3,2) NOT NULL,
            total_rating_sum INTEGER NOT NULL,
            feedback_list JSONB DEFAULT '[]',
            priority_score NUMERIC GENERATED ALWAYS AS (ask_count * (6 - average_rating)) STORED,
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        RAISE NOTICE '⚠️  Semantic deduplication disabled - all questions will be stored separately';
END $$;

-- Step 6: Create index on priority_score for dashboard sorting
CREATE INDEX idx_priority_score ON faq_rating_summary (priority_score DESC);

-- Step 7: Create index on created_at for chat_logs
CREATE INDEX idx_chat_logs_created_at ON chat_logs (created_at DESC);

-- Verification queries
-- SELECT COUNT(*) FROM chat_logs;
-- SELECT COUNT(*) FROM faq_rating_summary;
-- SELECT * FROM faq_rating_summary ORDER BY priority_score DESC LIMIT 10;
