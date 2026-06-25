# Star Rating System

## Overview
5-star rating system with semantic deduplication using Google Gemini embeddings. Automatically groups similar questions and highlights high-priority issues.

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install pgvector

# 2. Run migration
node runMigration.js

# 3. Test embeddings (optional)
node testEmbedding.js

# 4. Start server
npm start
```

## Features

- **Star Rating UI**: 1-5 stars with optional text feedback
- **Smart Grouping**: Similar questions merged using 0.90 similarity threshold
- **Priority Score**: `ask_count × (6 - average_rating)` - surfaces frequent low-rated questions
- **Admin Dashboard**: View all ratings, feedback, and priority items

## Database Tables

**chat_logs**: Raw audit trail (one row per rating)
```sql
id | question | answer | rating (1-5) | feedback_text | created_at
```

**faq_rating_summary**: Deduplicated questions with embeddings
```sql
id | representative_question | question_embedding (vector 768) | 
ask_count | average_rating | priority_score | feedback_list (jsonb)
```

## API Endpoints

**POST /api/rating** - Submit rating
```json
{"question": "...", "answer": "...", "rating": 4, "feedbackText": "..."}
```

**PATCH /api/rating/feedback** - Add feedback text
```json
{"logId": 123, "feedbackText": "..."}
```

**GET /api/admin/ratings** - Get all ratings (admin dashboard)

## How It Works

1. User rates AI response with stars → backend receives rating
2. Generate 768-dim embedding for question (Google text-embedding-004)
3. Search for similar questions (cosine similarity ≥0.90)
4. **Match found**: Update existing row (increment count, recalculate avg)
5. **No match**: Create new summary row with embedding
6. Admin sees grouped questions sorted by priority score

## Admin Dashboard

- Navigate to **admin.html** → Login → **⭐ Ratings Dashboard** tab
- Top 5 high-priority items highlighted in red
- Click "View Details" to see all feedback with timestamps
- Priority = frequent + low-rated questions

## Testing

Submit these similar questions - they should merge into one summary:
- "When can I start the internship?"
- "What is the start date for VINS?"
- "When does the program begin?"

Check: `SELECT * FROM faq_rating_summary;` → `ask_count` should be 3+

## Configuration

**Adjust similarity threshold** in `backend/controllers/feedbackController.js`:
```javascript
const similarEntry = await ratingModel.findSimilarQuestion(embedding, 0.90);
// Increase (0.92-0.95) = stricter matching
// Decrease (0.85-0.88) = looser matching
```

## Troubleshooting

**Migration fails**: Install pgvector extension for PostgreSQL
**No matches found**: Lower threshold to 0.85 or check embedding generation
**Admin dashboard empty**: Ensure backend running, ratings submitted
**Embeddings fail**: Verify `GEMINI_API_KEY` in `.env`

## Changes from Old System

**Removed**: 👍👎 thumbs up/down, automatic chat logging  
**Added**: 5-star ratings, semantic deduplication, priority scoring, admin analytics
