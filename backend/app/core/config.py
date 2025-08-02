from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://neondb_owner:npg_H0tBPrSl9EWX@ep-misty-scene-af4l72lf-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000",  "http://localhost:5173",  "http://127.0.0.1:3000"]
    
    # Groq - Fast Llama inference
    GROQ_API_KEY: str = "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"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  # Latest Llama model
    
    # OpenAI - Keep for compatibility (not used)
    OPENAI_API_KEY: str = "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"
    
    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    PINECONE_INDEX_NAME: str = "micronotes"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
