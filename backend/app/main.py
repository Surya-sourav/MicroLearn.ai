from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, users, spaces, documents, flashcards, chat, quizzes, multi_space_chat

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MicroNotes API",
    description="Educational AI application for creating and managing flashcards",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Credentials cannot be used with '*'
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(spaces.router, prefix="/api/v1/spaces", tags=["spaces"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(flashcards.router, prefix="/api/v1/flashcards", tags=["flashcards"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(quizzes.router, prefix="/api/v1/quizzes", tags=["quizzes"])
app.include_router(multi_space_chat.router, prefix="/api/v1/multi-space-chat", tags=["multi-space-chat"])

@app.get("/")
async def root():
    return {"message": "MicroNotes API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}