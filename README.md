# MicroLearn.ai 🎓

An intelligent learning platform that combines document processing, flashcards, and AI-powered chat to create an enhanced learning experience.

## 🚀 Features

- **Smart Document Processing**
  - Upload and process various document formats
  - Web page content extraction
  - YouTube video transcription and processing
  - Intelligent content parsing and organization

- **AI-Powered Learning Spaces**
  - Create dedicated learning spaces for different subjects
  - Organize study materials efficiently
  - Collaborative learning environment

- **Interactive Flashcards**
  - Automatic flashcard generation from documents
  - Spaced repetition learning system
  - Progress tracking and review optimization

- **Intelligent Chat Interface**
  - Context-aware AI chat assistance
  - Document-based question answering
  - Learning progress support

## 🏗️ Tech Stack

### Frontend
- React + TypeScript
- Vite for build tooling
- Redux for state management
- Tailwind CSS for styling
- ShadcnUI and RadixUI components

### Backend
- Python FastAPI
- Celery for background tasks
- PostgreSQL database
- Vector database for document embeddings
- LLM integration for AI features

## 🛠️ Project Structure

```
MicroLearn.ai/
├── frontend/           # React + TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Main application pages
│   │   ├── services/  # API integration
│   │   ├── store/     # Redux state management
│   │   └── hooks/     # Custom React hooks
│
└── backend/           # Python FastAPI backend
    └── app/
        ├── api/       # REST API endpoints
        ├── models/    # Database models
        ├── services/  # Business logic
        └── utils/     # Helper utilities
```

## 🚦 Getting Started

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🐳 Docker Support

The project includes Docker support for easy deployment:

```bash
docker-compose up

docker-compose logs -f backend # to check the api endpoint logs
```

## 🔐 Environment Variables

Create `.env` files in both frontend and backend directories. Required variables:

### Frontend
```env
VITE_API_URL=http://localhost:8000
```

### Backend
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
```

## 📝 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 