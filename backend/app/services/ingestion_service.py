import os
import asyncio
from typing import List
import uuid
import PyPDF2
import docx
import httpx
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.document import Document, ProcessingStatus
from app.models.space import Space
from app.services.vector_service import VectorService
from app.utils.document_parser import DocumentParser
from app.utils.web_scraper import WebScraper
from app.utils.youtube_extractor import YouTubeExtractor

class IngestionService:
    def __init__(self):
        self.vector_service = VectorService()
        self.document_parser = DocumentParser()
        self.web_scraper = WebScraper()
        self.youtube_extractor = YouTubeExtractor()
    
    async def process_document(self, document_id: uuid.UUID):
        """Process uploaded document and store in vector database"""
        db = SessionLocal()
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                return
            
            # Update status to processing
            document.processing_status = ProcessingStatus.PROCESSING
            db.commit()
            
            # Extract text based on content type
            if document.content_type.value == 'pdf':
                text_content = self.document_parser.extract_pdf_text(document.file_path)
            elif document.content_type.value == 'docx':
                text_content = self.document_parser.extract_docx_text(document.file_path)
            else:
                raise ValueError(f"Unsupported content type: {document.content_type}")
            
            # Chunk the content
            chunks = self._chunk_text(text_content)
            
            # Get space for namespace
            space = db.query(Space).filter(Space.id == document.space_id).first()
            if not space:
                raise ValueError("Space not found")
            
            # Store in vector database
            metadata = [{"document_id": str(document.id), "title": document.title} for _ in chunks]
            await self.vector_service.store_embeddings(chunks, space.vector_namespace, metadata)
            
            # Update document status
            document.processing_status = ProcessingStatus.COMPLETED
            document.content_preview = text_content[:500] if text_content else ""
            document.processed_at = datetime.utcnow()
            db.commit()
            
        except Exception as e:
            # Update status to failed
            document.processing_status = ProcessingStatus.FAILED
            db.commit()
            print(f"Error processing document {document_id}: {e}")
            
        finally:
            db.close()
    
    async def process_web_url(self, url: str, space_id: uuid.UUID):
        """Process web URL and store content"""
        db = SessionLocal()
        try:
            # Extract content from URL
            content = await self.web_scraper.scrape_url(url)
            
            # Chunk the content
            chunks = self._chunk_text(content)
            
            # Get space for namespace
            space = db.query(Space).filter(Space.id == space_id).first()
            if not space:
                return
            
            # Store in vector database
            metadata = [{"url": url, "type": "web"} for _ in chunks]
            await self.vector_service.store_embeddings(chunks, space.vector_namespace, metadata)
            
        finally:
            db.close()
    
    async def process_youtube_url(self, url: str, space_id: uuid.UUID):
        """Process YouTube URL and store transcript"""
        db = SessionLocal()
        try:
            # Extract transcript
            transcript = await self.youtube_extractor.get_transcript(url)
            
            # Chunk the content
            chunks = self._chunk_text(transcript)
            
            # Get space for namespace
            space = db.query(Space).filter(Space.id == space_id).first()
            if not space:
                return
            
            # Store in vector database
            metadata = [{"url": url, "type": "youtube"} for _ in chunks]
            await self.vector_service.store_embeddings(chunks, space.vector_namespace, metadata)
            
        finally:
            db.close()
    
    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size // 2:
                    chunk = text[start:break_point + 1]
                    end = break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap
            
            if start >= len(text):
                break
        
        return [chunk for chunk in chunks if chunk]
