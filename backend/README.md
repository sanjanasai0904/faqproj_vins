# FAQ Chatbot Backend

A modular Node.js + Express backend with PostgreSQL for an FAQ chatbot system.

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # PostgreSQL connection pool
├── services/
│   └── geminiService.js   # Google Gemini AI integration
├── routes/
│   ├── faqRoutes.js       # FAQ API routes
│   └── chatRoutes.js      # Chat API routes
├── controllers/
│   ├── faqController.js   # Business logic for FAQs
│   └── chatController.js  # Business logic for chat
├── models/
│   └── faqModel.js        # Database queries
├── database/
│   └── schema.sql         # Database schema and sample data
├── seed/
│   ├── faqData.json       # FAQ seed data
│   └── seedFaqs.js        # Seed script
├── server.js              # Main application entry point
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── README.md             # Documentation
└── GEMINI_SETUP.md       # Gemini API setup guide
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

1. Install PostgreSQL if not already installed
2. Create a new database:

```sql
CREATE DATABASE faq_chatbot;
```

3. Update `.env` file with your database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=faq_chatbot
DB_PORT=5432
```

### 3. Initialize Database Schema

Run the SQL script to create tables and insert sample data:

```bash
psql -U postgres -d faq_chatbot -f database/schema.sql
```

Or manually run the SQL commands from `database/schema.sql` in your PostgreSQL client.

### 4. Get Google Gemini API Key

Follow the detailed instructions in [GEMINI_SETUP.md](GEMINI_SETUP.md)

Quick steps:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 5. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Get All FAQs
- **URL:** `GET /api/faqs`
- **Description:** Retrieves all FAQs from the database
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "question": "What is a NOC?",
        "answer": "A NOC is a No Objection Certificate...",
        "category": "NOC",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Chat with AI Assistant
- **URL:** `POST /api/chat`
- **Description:** Send a message and get AI-powered response using Google Gemini
- **Request Body:**
  ```json
  {
    "conversationHistory": [
      { "role": "user", "content": "What is NOC?" },
      { "role": "assistant", "content": "A NOC is..." }
    ],
    "message": "How do I submit it?"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "reply": "You can submit your NOC through the VINS portal...",
    "updatedHistory": [...]
  }
  ```

### Health Check
- **URL:** `GET /`
- **Description:** Check if the API is running
- **Response:**
  ```json
  {
    "message": "FAQ Chatbot API is running",
    "status": "healthy"
  }
  ```

## 🧪 Testing the API

Using curl:
```bash
curl http://localhost:5000/api/faqs
```

Using browser:
```
http://localhost:5000/api/faqs
```

## 🔧 Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-restart

## 📝 Notes

- The backend uses connection pooling for efficient database connections
- CORS is enabled for all origins (configure for production use)
- Error handling is implemented with try/catch blocks
- The code follows a modular architecture with separation of concerns
