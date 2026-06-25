/**
 * FAQ Feedback Model
 * Handles DB operations for thumbs up/down feedback on static FAQ answers.
 *
 * Table: faq_feedback
 *   id                SERIAL PRIMARY KEY
 *   faq_id            INTEGER NOT NULL (FK to faqs.id)
 *   response_snapshot TEXT    NOT NULL  -- snapshot of FAQ answer at time of first feedback
 *   thumbs_up_count   INTEGER DEFAULT 0
 *   thumbs_down_count INTEGER DEFAULT 0
 *   feedback_entries  JSONB   DEFAULT '[]'   -- array of {type, text, created_at}
 *   created_at        TIMESTAMP DEFAULT NOW()
 *   updated_at        TIMESTAMP DEFAULT NOW()
 *
 *   UNIQUE (faq_id, response_snapshot) -- one row per distinct answer version per FAQ
 */

const db = require('../config/db');

/**
 * Ensure the faq_feedback table exists with correct schema.
 * If the old table exists with UNIQUE(faq_id), migrates it to UNIQUE(faq_id, response_snapshot).
 */
async function createTableIfNotExists() {
    // Create table if it does not exist at all
    await db.query(`
        CREATE TABLE IF NOT EXISTS faq_feedback (
            id                SERIAL PRIMARY KEY,
            faq_id            INTEGER NOT NULL,
            response_snapshot TEXT    NOT NULL DEFAULT '',
            thumbs_up_count   INTEGER NOT NULL DEFAULT 0,
            thumbs_down_count INTEGER NOT NULL DEFAULT 0,
            feedback_entries  JSONB   NOT NULL DEFAULT '[]',
            created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    // Ensure response_snapshot column exists (migration for older schema)
    await db.query(`
        ALTER TABLE faq_feedback
            ADD COLUMN IF NOT EXISTS response_snapshot TEXT NOT NULL DEFAULT '';
    `);

    // Drop old single-column unique constraint on faq_id if it exists
    await db.query(`
        DO $$
        DECLARE
            con_name TEXT;
        BEGIN
            SELECT conname INTO con_name
            FROM pg_constraint
            WHERE conrelid = 'faq_feedback'::regclass
              AND contype = 'u'
              AND array_length(conkey, 1) = 1
              AND conkey[1] = (
                  SELECT attnum FROM pg_attribute
                  WHERE attrelid = 'faq_feedback'::regclass AND attname = 'faq_id'
              );
            IF con_name IS NOT NULL THEN
                EXECUTE format('ALTER TABLE faq_feedback DROP CONSTRAINT %I', con_name);
            END IF;
        END
        $$;
    `);

    // Add composite unique constraint if it doesn't already exist
    await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conrelid = 'faq_feedback'::regclass
                  AND contype = 'u'
                  AND array_length(conkey, 1) = 2
            ) THEN
                ALTER TABLE faq_feedback
                    ADD CONSTRAINT faq_feedback_faq_id_snapshot_uq
                    UNIQUE (faq_id, response_snapshot);
            END IF;
        END
        $$;
    `);
}

/**
 * Submit a thumbs-up or thumbs-down for a FAQ.
 *
 * Grouping logic:
 *  - Fetch the FAQ's CURRENT answer from faqs table (response_snapshot).
 *  - Look for an existing row WHERE faq_id = ? AND response_snapshot = current answer.
 *  - If found  → increment count + append entry to JSONB array.
 *  - If not found → insert new row (e.g. first feedback OR answer was edited).
 */
async function submitFeedback(faqId, type, text) {
    // 1. Fetch current answer text
    const faqRes = await db.query('SELECT answer FROM faqs WHERE id = $1', [faqId]);
    if (faqRes.rows.length === 0) throw new Error('FAQ not found');
    const currentAnswer = faqRes.rows[0].answer;

    const newEntry = { type, text: text || null, created_at: new Date().toISOString() };

    // 2. Look for existing row matching faq_id + response_snapshot
    const existing = await db.query(
        'SELECT * FROM faq_feedback WHERE faq_id = $1 AND response_snapshot = $2',
        [faqId, currentAnswer]
    );

    if (existing.rows.length === 0) {
        // 3a. No matching row — insert new (first feedback OR this is a newer answer version)
        const upCount   = type === 'up'   ? 1 : 0;
        const downCount = type === 'down' ? 1 : 0;
        const result = await db.query(
            `INSERT INTO faq_feedback
                (faq_id, response_snapshot, thumbs_up_count, thumbs_down_count, feedback_entries)
             VALUES ($1, $2, $3, $4, $5::jsonb)
             RETURNING *`,
            [faqId, currentAnswer, upCount, downCount, JSON.stringify([newEntry])]
        );
        return result.rows[0];
    } else {
        // 3b. Found matching row — increment count + append entry
        const row = existing.rows[0];
        const upCount   = row.thumbs_up_count   + (type === 'up'   ? 1 : 0);
        const downCount = row.thumbs_down_count + (type === 'down' ? 1 : 0);
        const entries   = [...(row.feedback_entries || []), newEntry];

        const result = await db.query(
            `UPDATE faq_feedback
             SET thumbs_up_count   = $1,
                 thumbs_down_count = $2,
                 feedback_entries  = $3::jsonb,
                 updated_at        = NOW()
             WHERE id = $4
             RETURNING *`,
            [upCount, downCount, JSON.stringify(entries), row.id]
        );
        return result.rows[0];
    }
}

/**
 * Get all FAQ feedback rows joined with FAQ question + current answer,
 * sorted by thumbs_down_count DESC (most disliked first).
 */
async function getAllFeedback() {
    const result = await db.query(`
        SELECT
            ff.*,
            f.question AS faq_question,
            f.answer   AS current_answer,
            (ff.thumbs_up_count + ff.thumbs_down_count) AS total_count
        FROM faq_feedback ff
        JOIN faqs f ON ff.faq_id = f.id
        ORDER BY ff.thumbs_down_count DESC, ff.updated_at DESC
    `);
    return result.rows;
}

/**
 * Delete all feedback for a given faq_feedback row (by faq_feedback.id).
 */
async function deleteFeedbackRow(rowId) {
    const result = await db.query(
        'DELETE FROM faq_feedback WHERE id = $1 RETURNING *',
        [rowId]
    );
    return result.rows[0] || null;
}

/**
 * Remove a single entry from feedback_entries by index, decrement count.
 * If feedback_entries becomes empty, leave row intact (admin can row-delete separately).
 */
async function deleteFeedbackEntry(rowId, entryIdx) {
    const existing = await db.query('SELECT * FROM faq_feedback WHERE id = $1', [rowId]);
    if (existing.rows.length === 0) throw new Error('Row not found');

    const row     = existing.rows[0];
    const entries = row.feedback_entries || [];
    if (entryIdx < 0 || entryIdx >= entries.length) throw new Error('Entry index out of range');

    const removed    = entries[entryIdx];
    const newEntries = entries.filter((_, i) => i !== entryIdx);

    const upDelta   = removed.type === 'up'   ? -1 : 0;
    const downDelta = removed.type === 'down' ? -1 : 0;

    const result = await db.query(
        `UPDATE faq_feedback
         SET thumbs_up_count   = thumbs_up_count   + $1,
             thumbs_down_count = thumbs_down_count + $2,
             feedback_entries  = $3::jsonb,
             updated_at        = NOW()
         WHERE id = $4
         RETURNING *`,
        [upDelta, downDelta, JSON.stringify(newEntries), rowId]
    );
    return result.rows[0];
}

/**
 * Update the answer of a FAQ in the faqs table.
 * Called from Admin "Edit Answer" in the FAQ Feedback section.
 * NOTE: This does NOT update response_snapshot on existing feedback rows —
 *       they remain as historical records. New feedback will create a fresh row
 *       against the new answer text.
 */
async function updateFaqAnswer(faqId, newAnswer) {
    const result = await db.query(
        'UPDATE faqs SET answer = $1 WHERE id = $2 RETURNING *',
        [newAnswer, faqId]
    );
    return result.rows[0] || null;
}

module.exports = {
    createTableIfNotExists,
    submitFeedback,
    getAllFeedback,
    deleteFeedbackRow,
    deleteFeedbackEntry,
    updateFaqAnswer
};
