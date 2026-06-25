# FAQ Chatbot - VINS Assistant

A full-stack AI-powered FAQ chatbot for VINS interns with Google Gemini integration, featuring a comprehensive **star rating system with semantic deduplication**.

## ⭐ Star Rating System (NEW!)

The chatbot now includes a sophisticated feedback system:
- **1-5 star ratings** with optional text feedback
- **Semantic deduplication** using Google text-embedding-004 (groups similar questions automatically)
- **Priority scoring** highlights high-frequency, low-rated questions
- **Admin analytics dashboard** with expandable feedback details
- **Vector similarity search** using PostgreSQL pgvector extension

📖 **[Read Full Documentation →](STAR_RATING_SYSTEM.md)**

## 📁 Project Structure

```
faq_chatbot/
├── backend/                    # Node.js + Express + PostgreSQL + Gemini AI
│   ├── config/                # Database configuration
│   ├── controllers/           # Request handlers
│   ├── models/                # Database queries
│   ├── routes/                # API endpoints
│   ├── services/              # Gemini AI integration
│   ├── seed/                  # Database seed data
│   ├── database/              # SQL schemas
│   └── server.js              # Main server file
│
├── faqproj_vins-main/         # Main Website Frontend
│   ├── assistant.html         # ✅ AI Assistant (Backend Integrated)
│   ├── index.html             # Browse FAQs
│   ├── intro.html             # Getting Started
│   ├── dashboard.html         # Analytics
│   ├── admin.html             # Admin Panel
│   ├── style.css              # Global styles
│   ├── theme.js               # Theme switcher
│   └── INTEGRATION_GUIDE.md   # Setup instructions
│
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
└── INTEGRATION_COMPLETE.md    # Integration summary
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Google Gemini API key

### 1. Setup Backend

```bash
# Install dependencies
cd backend
npm install

# Configure environment
# Edit backend/.env with your credentials:
#   - DB_PASSWORD (your PostgreSQL password)
#   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)

# Create database
createdb -U postgres faq_chatbot

# Setup tables
node createTable.js
npm run setup-logs

# Start server
npm run dev
```

Expected output:
```
🚀 Server is running on port 5000
📡 API available at http://localhost:5000/api
```

### 2. Open Frontend

**Option A: Direct Open**
```bash
# Double-click this file:
faqproj_vins-main/assistant.html
```

**Option B: Local Server (Recommended)**
```bash
cd faqproj_vins-main
python -m http.server 8000
# Open: http://localhost:8000/assistant.html
```

### 3. Test

Type: **"What is NOC?"** and watch the AI respond! 🎉

## 📖 Documentation

- **Integration Guide:** [faqproj_vins-main/INTEGRATION_GUIDE.md](faqproj_vins-main/INTEGRATION_GUIDE.md)
- **Integration Summary:** [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)
- **Quick Test:** [faqproj_vins-main/QUICK_TEST.md](faqproj_vins-main/QUICK_TEST.md)
- **Backend Setup:** [backend/README.md](backend/README.md)
- **Gemini Setup:** [backend/GEMINI_SETUP.md](backend/GEMINI_SETUP.md)

## 🎯 Features

### ✅ AI Assistant
- Natural language understanding via Google Gemini
- Multi-turn conversations with context memory
- Answers based on PostgreSQL FAQ database
- Conversation logging for analytics

### ✅ Main Website
- Professional UI with navigation
- Multiple pages (FAQs, Dashboard, Admin)
- Dark/Light theme switcher
- Responsive design
- **AI Assistant fully integrated**

### ✅ Backend
- RESTful API with Express
- PostgreSQL database
- Google Gemini AI integration
- Feedback logging system
- Error handling & validation

## 🛠️ Technology Stack

**Frontend:**
- Pure HTML5, CSS3, JavaScript
- No frameworks or build tools
- Vanilla JS fetch API

**Backend:**
- Node.js + Express
- PostgreSQL + pg driver
- Google Gemini AI SDK
- dotenv, cors

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/api/faqs` | GET | Get all FAQs |
| `/api/chat` | POST | Send message, get AI response |
| `/api/feedback` | POST | Submit feedback (👍👎) |
| `/api/feedback/stats` | GET | Get feedback statistics |

## 🧪 Testing

```bash
# Test backend
curl http://localhost:5000

# Test chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationHistory":[],"message":"What is NOC?"}'
```

## 🔧 Configuration

### Backend Environment Variables

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=faq_chatbot
DB_PORT=5432
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend API URL

In `faqproj_vins-main/assistant.html`:
```javascript
const CHAT_API_URL = 'http://localhost:5000/api/chat';
```

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
node testConnection.js  # Test database connection
```

### Frontend shows errors
- Check backend is running: http://localhost:5000
- Check browser console (F12) for error details
- Ensure CORS is enabled (already configured)

### AI not responding
- Verify Gemini API key in `backend/.env`
- Check backend logs for errors
- Ensure database has FAQs: `SELECT COUNT(*) FROM faqs;`

## 📊 Current Status

- ✅ Backend API operational
- ✅ PostgreSQL database connected
- ✅ Google Gemini AI integrated
- ✅ Main website frontend integrated
- ✅ AI Assistant working with multi-turn conversations
- ✅ Feedback logging implemented
- ✅ Error handling complete

## 🎉 Integration Complete!

The main VINS website (faqproj_vins-main) is now fully integrated with the AI backend.

**To start using:**
1. Run: `cd backend && npm run dev`
2. Open: `faqproj_vins-main/assistant.html`
3. Start chatting!

For detailed instructions, see [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)


## 📡 API Endpoints

- `GET http://localhost:5000/api/faqs` - Get all FAQs

## ✅ Current Status

- ✅ Frontend UI built with vanilla HTML/CSS/JS
- ✅ Backend API with PostgreSQL
- ✅ FAQ data fetched and cached on page load
- ✅ 143 FAQs loaded in database
- ✅ Google Gemini AI integration for natural responses
- ✅ Multi-turn conversation memory
- ✅ Fuzzy search fallback (Fuse.js)
- ✅ Feedback logging system (👍 👎)
- ✅ Analytics endpoint for feedback statistics

## 🛠️ Technologies

**Frontend:**
- Pure HTML5, CSS3, JavaScript (no frameworks)
- Responsive design
- Modern chat UI

**Backend:**
- Node.js + Express
- PostgreSQL with pg driver
- CORS enabled
- Environment-based configuration

## 📝 Notes

- The backend uses connection pooling for efficient database connections
- CORS is enabled for all origins (configure for production use)
- Error handling is implemented with try/catch blocks
- The code follows a modular architecture with separation of concerns
- Gemini AI provides natural language responses based on FAQ data
- Conversation history enables multi-turn conversations with context
- Frontend falls back to local fuzzy search if API is unavailable
