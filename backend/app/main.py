from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, users, spaces, documents, flashcards, chat

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
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(spaces.router, prefix="/api/v1/spaces", tags=["spaces"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(flashcards.router, prefix="/api/v1/flashcards", tags=["flashcards"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "MicroNotes API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}