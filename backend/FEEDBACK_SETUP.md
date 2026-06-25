# Feedback Logging System - Setup Guide

## 📊 Overview

The feedback system logs all chat interactions and allows users to rate bot responses with thumbs up/down feedback.

## 🗄️ Database Setup

### Step 1: Create the chat_logs Table

Run the Node.js script:
```bash
cd backend
node createLogsTable.js
```

Or manually run the SQL:
```bash
psql -U postgres -d faq_chatbot -f database/createLogsTable.sql
```

Or directly in PostgreSQL:
```sql
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    user_message TEXT NOT NULL,
    bot_reply TEXT NOT NULL,
    feedback VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key, auto-increments |
| `user_message` | TEXT | User's question/message |
| `bot_reply` | TEXT | Bot's response |
| `feedback` | VARCHAR(10) | 'up', 'down', or NULL |
| `created_at` | TIMESTAMP | When the interaction happened |

## 🏗️ Architecture

### Backend Files

```
backend/
├── models/
│   └── logModel.js              ✅ Database queries for logs
├── controllers/
│   ├── chatController.js        ✅ Modified to log conversations
│   └── feedbackController.js    ✅ Handles feedback submission
└── routes/
    └── feedbackRoutes.js        ✅ Feedback API endpoints
```

### Flow Diagram

```
User sends message
    ↓
chatController.handleChat()
    ↓
Get Gemini response
    ↓
logModel.createLog(message, reply)  ← Logs to database, returns logId
    ↓
Return { reply, updatedHistory, logId }
    ↓
Frontend displays message with feedback buttons
    ↓
User clicks 👍 or 👎
    ↓
POST /api/feedback { logId, feedback }
    ↓
logModel.updateFeedback(logId, feedback)
    ↓
Disable buttons, highlight selected
```

## 📡 API Endpoints

### POST /api/feedback
Submit feedback for a chat log

**Request:**
```json
{
  "logId": 123,
  "feedback": "up"
}
```

**Validation:**
- `logId` must be a number
- `feedback` must be either "up" or "down"

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded successfully"
}
```

### GET /api/feedback/stats
Get feedback statistics (analytics)

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_logs": 150,
    "positive": 120,
    "negative": 20,
    "no_feedback": 10
  }
}
```

## 🎨 Frontend Features

### Feedback Buttons

Every bot message (with a logId) displays two buttons:
- 👍 Thumbs up (helpful)
- 👎 Thumbs down (not helpful)

### User Experience

1. **Before feedback:** Both buttons are semi-transparent and hoverable
2. **On click:** 
   - Feedback is sent to backend
   - Both buttons become disabled
   - Selected button is highlighted (opacity: 1, scaled up)
   - Other button remains dim
3. **One feedback per message:** Users can't change their feedback after submission

### Visual States

```css
/* Default state */
.feedback-btn {
    opacity: 0.6;
    cursor: pointer;
}

/* Hover state */
.feedback-btn:hover {
    opacity: 1;
    transform: scale(1.1);
}

/* After submission */
.feedback-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Selected button */
button.selected {
    opacity: 1;
    transform: scale(1.2);
}
```

## 📊 Analytics Queries

### Most helpful responses
```sql
SELECT bot_reply, COUNT(*) as upvotes
FROM chat_logs
WHERE feedback = 'up'
GROUP BY bot_reply
ORDER BY upvotes DESC
LIMIT 10;
```

### Most problematic responses
```sql
SELECT user_message, bot_reply, COUNT(*) as downvotes
FROM chat_logs
WHERE feedback = 'down'
GROUP BY user_message, bot_reply
ORDER BY downvotes DESC
LIMIT 10;
```

### Feedback rate
```sql
SELECT
    ROUND(COUNT(CASE WHEN feedback = 'up' THEN 1 END) * 100.0 / COUNT(*), 2) as positive_rate,
    ROUND(COUNT(CASE WHEN feedback = 'down' THEN 1 END) * 100.0 / COUNT(*), 2) as negative_rate,
    ROUND(COUNT(CASE WHEN feedback IS NULL THEN 1 END) * 100.0 / COUNT(*), 2) as no_feedback_rate
FROM chat_logs;
```

### Daily interaction volume
```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_interactions,
    COUNT(CASE WHEN feedback = 'up' THEN 1 END) as positive,
    COUNT(CASE WHEN feedback = 'down' THEN 1 END) as negative
FROM chat_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🧪 Testing

### Test the logging (automatically happens on every chat)
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationHistory": [],
    "message": "What is NOC?"
  }'
```

Check the response includes `logId`:
```json
{
  "success": true,
  "reply": "...",
  "updatedHistory": [...],
  "logId": 1
}
```

### Test feedback submission
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "logId": 1,
    "feedback": "up"
  }'
```

### Check feedback stats
```bash
curl http://localhost:5000/api/feedback/stats
```

### Verify in database
```sql
SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT 5;
```

## 🔧 Troubleshooting

### Error: "relation 'chat_logs' does not exist"
**Solution:** Run the table creation script:
```bash
node createLogsTable.js
```

### Feedback buttons not appearing
**Check:**
1. Is `logId` being returned from `/api/chat`?
2. Check browser console for JavaScript errors
3. Verify CSS is loaded (feedback-buttons class)

### Feedback not saving
**Check:**
1. Backend logs for errors
2. Network tab in browser DevTools
3. Verify logId matches a real row in chat_logs table

## 📈 Future Enhancements

1. **Feedback reasons:** Add textarea for "Why wasn't this helpful?"
2. **Admin dashboard:** Visual analytics interface
3. **Auto-improve:** Use feedback to fine-tune responses
4. **Export data:** CSV/Excel export for analysis
5. **Real-time stats:** WebSocket for live feedback monitoring
6. **Feedback trends:** Track improvement over time

## 🎯 Best Practices

1. **Never delete logs:** Retain all data for analysis
2. **Index frequently queried columns:** Already done (feedback, created_at)
3. **Regular backups:** Backup chat_logs table regularly
4. **Monitor negative feedback:** Set up alerts for high downvote rates
5. **Review & improve:** Weekly review of downvoted responses

## ✅ Setup Complete!

Your chatbot now:
- ✅ Logs every interaction to PostgreSQL
- ✅ Returns logId with every response
- ✅ Displays feedback buttons on bot messages
- ✅ Records user feedback (up/down)
- ✅ Prevents duplicate feedback
- ✅ Provides analytics endpoint

Start chatting and see the feedback system in action! 🎉
