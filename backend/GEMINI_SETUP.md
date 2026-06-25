# Google Gemini API Setup Guide

## 🔑 Getting Your Gemini API Key

### Step 1: Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key

### Step 2: Add to .env File
Open `backend/.env` and replace the placeholder with your actual API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

⚠️ **Important:** Never commit your API key to version control!

## 📦 Install Dependencies

```bash
cd backend
npm install
```

This will install the `@google/generative-ai` package along with other dependencies.

## 🚀 Start the Backend

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🧪 Test the Chat Endpoint

Using curl:
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationHistory": [],
    "message": "What is NOC?"
  }'
```

Expected response:
```json
{
  "success": true,
  "reply": "A NOC is a No Objection Certificate...",
  "updatedHistory": [
    { "role": "user", "content": "What is NOC?" },
    { "role": "assistant", "content": "A NOC is a No Objection Certificate..." }
  ]
}
```

## 📊 How It Works

1. **Frontend sends:** User message + conversation history
2. **Backend fetches:** All FAQs from PostgreSQL
3. **Gemini receives:** System instruction with FAQs + conversation history + new message
4. **Gemini responds:** Natural language answer based only on FAQ data
5. **Backend returns:** Reply + updated conversation history
6. **Frontend stores:** Updated history for next turn

## 🔧 Configuration

### Model Settings (in geminiService.js)
- **Model:** `gemini-1.5-flash` (fast and efficient)
- **Temperature:** 0.7 (balanced creativity)
- **Max tokens:** 1024 (concise responses)

### System Instructions
The bot is instructed to:
- Answer ONLY using the FAQ list provided
- Ask clarifying questions if ambiguous
- Admit when it doesn't know something
- Keep responses concise and friendly

## 🐛 Troubleshooting

### Error: "Invalid or missing Gemini API key"
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid at Google AI Studio
- Restart the server after updating `.env`

### Error: "Gemini API quota exceeded"
- You've hit the free tier limit
- Wait for quota reset or upgrade your plan
- Free tier: 60 requests per minute

### Error: "Failed to get response from Gemini API"
- Check your internet connection
- Verify the API key has proper permissions
- Check Google AI Studio for service status

## 🎯 Next Steps

Once the API key is configured:
1. Start the backend: `npm run dev`
2. Open the frontend in a browser
3. Start chatting with the AI assistant!

The bot will use your 143 FAQs to answer questions naturally with multi-turn conversation memory.
