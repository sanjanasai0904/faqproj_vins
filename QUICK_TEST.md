# ⚡ Quick Test Guide

## 🚀 Start in 3 Steps

### Step 1: Start Backend (1 minute)
```bash
cd d:\faq_chatbot\backend
npm run dev
```

✅ Wait for: `🚀 Server is running on port 5000`

### Step 2: Open Assistant (10 seconds)
**Double-click:** `d:\faq_chatbot\faqproj_vins-main\assistant.html`

### Step 3: Test (30 seconds)
Type: **"What is NOC?"**

✅ You should see AI response!

---

## 🧪 Full Test Checklist

### Backend Check
- [ ] Open terminal
- [ ] `cd d:\faq_chatbot\backend`
- [ ] `npm run dev`
- [ ] See: "Server is running on port 5000"

### Frontend Check
- [ ] Open `assistant.html`
- [ ] See: Navigation bar
- [ ] See: Chat with welcome message
- [ ] See: Input field at bottom

### Chat Test
- [ ] Type: "What is NOC?"
- [ ] Click "Ask AI" (or press Enter)
- [ ] See: Your message (right side, purple)
- [ ] See: Typing dots animation
- [ ] See: Bot response (left side, gray)
- [ ] Check: Console (F12) shows "✅ AI response received successfully"

### Multi-Turn Test
- [ ] Ask: "What is NOC?"
- [ ] Bot responds about NOC
- [ ] Ask: "How do I submit it?"
- [ ] Bot understands "it" = NOC
- [ ] Gives submission instructions

### Theme Test
- [ ] Click theme toggle (top right)
- [ ] Page switches to light mode
- [ ] Click again
- [ ] Back to dark mode

### Navigation Test
- [ ] Click "Browse FAQs" link
- [ ] Opens index.html
- [ ] Click "AI Assistant" link
- [ ] Back to assistant.html

---

## ✅ Success Criteria

**You know it's working when:**

1. ✅ Backend console shows:
   ```
   💬 Received chat message: "What is NOC?"
   📚 Loaded X FAQs for context
   ✅ Gemini API response received
   📝 Chat logged with ID: X
   ✅ Chat response sent successfully
   ```

2. ✅ Browser console shows:
   ```
   ✅ AI response received successfully
   ```

3. ✅ Chat displays:
   - Your question (purple bubble, right)
   - AI answer (gray bubble, left)
   - No error messages

---

## ❌ Troubleshooting

### Problem: "Sorry, I'm having trouble connecting"

**Fix:**
1. Check backend terminal - is it running?
2. Look for error messages
3. Restart backend:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

### Problem: No typing indicator

**Fix:**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache

### Problem: CORS error

**Fix:** Use local server:
```bash
cd d:\faq_chatbot\faqproj_vins-main
python -m http.server 8000
# Open: http://localhost:8000/assistant.html
```

### Problem: Old hardcoded responses

**Fix:**
- You're looking at old cached version
- Hard refresh: Ctrl+Shift+R
- Or close and reopen browser

---

## 📊 What to Expect

### First Message (~2-3 seconds)
```
User: "What is NOC?"
  ↓ (typing dots)
Bot: "A NOC (No Objection Certificate) is a document 
      required from your college/university..."
```

### Follow-up Message (~1-2 seconds)
```
User: "How do I submit it?"
  ↓ (typing dots)
Bot: "You can submit your NOC through the VINS portal
      under the Documents section..."
```

**The bot remembers "it" = NOC!**

---

## 🎯 Test Questions

Try these to verify AI is working:

1. **"What is NOC?"**
   - Should explain No Objection Certificate

2. **"How do I earn spurti points?"**
   - Should list ways to earn points

3. **"Tell me about ViBe benefits"**
   - Should explain ViBe program

4. **"When does internship start?"**
   - Should give info about start dates

5. **"What is Rosetta journal?"**
   - Should explain journal requirements

---

## 🔍 Debug Mode

Press **F12** to open developer console.

**Look for:**
- ✅ Green checkmarks = Success
- ❌ Red errors = Problem
- 📊 Blue logs = Info

**Common logs:**
```
✅ Loaded 143 FAQs successfully
🔎 Searched for: "what is noc"
📊 Found 3 results
✅ Chat response received from Gemini
```

---

## ⏱️ Performance

**Expected timings:**
- Backend startup: ~3 seconds
- First chat response: ~2-3 seconds
- Follow-up responses: ~1-2 seconds
- Theme toggle: Instant
- Page navigation: Instant

---

## 🎉 You're Done!

If all tests pass, your AI assistant is **fully integrated and working!**

**Enjoy your AI-powered VINS support chatbot! 🤖**
