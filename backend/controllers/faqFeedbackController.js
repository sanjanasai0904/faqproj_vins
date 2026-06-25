/**
 * FAQ Feedback Controller
 * Handles thumbs up/down feedback for static FAQ answers.
 */

const faqFeedbackModel = require('../models/faqFeedbackModel');

/**
 * POST /api/faq-feedback
 * Body: { faq_id: number, type: 'up'|'down', text?: string }
 */
const submitFeedback = async (req, res) => {
    try {
        const { faq_id, type, text } = req.body;

        if (!faq_id || !['up', 'down'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'faq_id and type ("up" or "down") are required'
            });
        }

        if (type === 'down' && (!text || !text.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Thumbs-down feedback requires a text comment'
            });
        }

        const row = await faqFeedbackModel.submitFeedback(
            parseInt(faq_id, 10),
            type,
            text ? text.trim() : null
        );

        return res.status(201).json({ success: true, data: row });
    } catch (err) {
        console.error('submitFeedback error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/admin/faq-feedback
 * Returns all FAQ feedback rows with counts, entries, and FAQ question.
 */
const getAllFeedback = async (req, res) => {
    try {
        const rows = await faqFeedbackModel.getAllFeedback();
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('getAllFeedback error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/admin/faq-feedback/:id
 * Deletes all feedback for a FAQ feedback row.
 */
const deleteFeedbackRow = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, message: 'id must be an integer' });
        }
        const deleted = await faqFeedbackModel.deleteFeedbackRow(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Row not found' });
        }
        return res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('deleteFeedbackRow error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/admin/faq-feedback/:id/entries/:idx
 * Removes a single feedback entry by index from the JSONB array.
 */
const deleteFeedbackEntry = async (req, res) => {
    try {
        const id  = parseInt(req.params.id,  10);
        const idx = parseInt(req.params.idx, 10);
        if (!Number.isInteger(id) || !Number.isInteger(idx)) {
            return res.status(400).json({ success: false, message: 'id and idx must be integers' });
        }
        const updated = await faqFeedbackModel.deleteFeedbackEntry(id, idx);
        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('deleteFeedbackEntry error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PATCH /api/admin/faq-feedback/:faqId/answer
 * Body: { answer: string }
 * Updates the FAQ answer in the faqs table (live edit from admin).
 */
const updateFaqAnswer = async (req, res) => {
    try {
        const faqId = parseInt(req.params.faqId, 10);
        const { answer } = req.body;

        if (!Number.isInteger(faqId)) {
            return res.status(400).json({ success: false, message: 'faqId must be an integer' });
        }
        if (!answer || !answer.trim()) {
            return res.status(400).json({ success: false, message: 'answer is required' });
        }

        const updated = await faqFeedbackModel.updateFaqAnswer(faqId, answer.trim());
        if (!updated) {
            return res.status(404).json({ success: false, message: 'FAQ not found' });
        }
        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('updateFaqAnswer error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedback,
    deleteFeedbackRow,
    deleteFeedbackEntry,
    updateFaqAnswer
};
