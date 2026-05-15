# 🧠 StudyAI — AI-Powered Study Platform

A full-stack MERN application that uses **Google Gemini AI** to supercharge student learning. Upload notes, PDFs, or YouTube videos and instantly generate summaries, quizzes, flashcards, study plans, and more.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **AI Summary Generator** | Short, detailed, bullet-point, and key-concept summaries |
| 🧒 **Explain Like I'm 10** | Simplify complex topics for beginners |
| ❓ **AI Quiz Generator** | MCQ, True/False, and fill-in-the-blank quizzes with scoring |
| 🃏 **Flashcard System** | Spaced-repetition flashcards with flip card UI |
| 💬 **AI Chatbot** | Context-aware doubt solver with conversation history |
| 📅 **Study Planner** | Personalized timetables based on your exam date |
| 📊 **Analytics Dashboard** | Track study time, quiz scores, and subject progress |
| 🍅 **Pomodoro Timer** | Focus mode with session logging |
| ▶️ **YouTube Summarizer** | Extract transcripts and generate notes from videos |
| 🔐 **JWT Authentication** | Secure signup/login with protected routes |

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router v6  
**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Multer  
**AI:** Google Gemini 1.5 Flash API  
**Deployment:** Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas

---

## 📁 Project Structure

```
ai-study-platform/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & file upload
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Express routers
│   ├── utils/          # Gemini AI & PDF parser
│   ├── uploads/        # Uploaded files (gitignored)
│   ├── server.js       # Entry point
│   └── .env.example
└── frontend/
    ├── public/
    └── src/
        ├── components/     # Reusable UI components
        ├── context/        # Auth context
        ├── pages/          # Full page components
        ├── services/       # Axios API layer
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))

---

### 1. Clone and install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-study-platform
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
```

### 3. Configure frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run development servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/profile` | Update profile |
| PUT  | `/api/auth/password` | Change password |

### Files
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload PDF/TXT file |
| POST | `/api/files/youtube` | Add YouTube video |
| GET  | `/api/files` | Get all user files |
| DELETE | `/api/files/:id` | Delete a file |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/summary/:fileId` | Generate summary |
| POST | `/api/ai/explain` | Explain Like I'm 10 |
| POST | `/api/ai/revision/:fileId` | Generate revision sheet |
| POST | `/api/ai/youtube-summary/:fileId` | Summarize YouTube video |

### Quiz
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/quiz/generate/:fileId` | Generate quiz |
| POST | `/api/quiz/:quizId/submit` | Submit quiz answers |
| GET  | `/api/quiz` | Get all quizzes |

### Flashcards
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/flashcards/generate/:fileId` | Generate flashcards |
| GET  | `/api/flashcards` | Get all flashcard sets |
| PATCH | `/api/flashcards/:id/card/:idx/review` | Mark card as known |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send message |
| GET  | `/api/chat` | Get chat sessions |
| GET  | `/api/chat/:chatId` | Get chat history |

### Study Planner
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/planner/generate` | Generate study plan |
| GET  | `/api/planner` | Get all plans |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/analytics` | Get analytics data |
| POST | `/api/analytics/session` | Log study session |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel or use Vercel CLI
vercel --prod
```

### Backend → Render/Railway
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables in dashboard
4. Deploy from GitHub repo

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com](https://www.mongodb.com/atlas)
2. Create database user
3. Whitelist all IPs (`0.0.0.0/0`)
4. Copy connection string to `MONGODB_URI`

---

## 🗃️ Database Schemas

| Model | Fields |
|---|---|
| **User** | name, email, password (hashed), preferences, streak, stats |
| **UploadedFile** | user, filename, fileType, extractedText, subject, summary |
| **QuizResult** | user, questions, score, timeTaken, completed |
| **Flashcard** | user, cards (question/answer/difficulty), masteredCards |
| **StudyPlan** | user, examDate, subjects, schedule, tips |
| **ChatHistory** | user, messages (role/content), sourceFile |
| **Analytics** | user, studySessions, subjectProgress, achievements |

---

## 🔒 Security Features

- ✅ JWT authentication with expiry
- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ Rate limiting (100 req/15min general, 20 req/min for AI)
- ✅ Helmet.js security headers
- ✅ CORS with origin whitelist
- ✅ Input validation with express-validator
- ✅ File type and size validation
- ✅ User-scoped data access (users can only see their own data)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this for your final year project, portfolio, or startup MVP.

---

## 💡 Built With

- [Google Gemini AI](https://ai.google.dev/)
- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
