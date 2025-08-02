import os
import asyncio
from typing import List, Dict, Any
import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.document import Document, ProcessingStatus
from app.models.space import Space
from app.services.vector_service import VectorService
from app.services.content_extraction_service import ContentExtractionService
from app.utils.document_parser import DocumentParser
from app.utils.youtube_extractor import YouTubeExtractor
from app.utils.web_scraper import WebScraper
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self):
        self.vector_service = VectorService()
        self.document_parser = DocumentParser()
        self.content_extraction = ContentExtractionService()
        self.youtube_extractor = YouTubeExtractor()
        self.web_scraper = WebScraper()
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=self._count_tokens,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def _count_tokens(self, text: str) -> int:
        enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
        return len(enc.encode(text))
    
    async def process_youtube_url(self, url: str, space_id: uuid.UUID):
        """Process YouTube URL and extract transcript"""
        db = SessionLocal()
        try:
            # Find the document record
            document = db.query(Document).filter(
                Document.file_path == url,
                Document.space_id == space_id
            ).first()
            
            if not document:
                logger.error(f"Document not found for YouTube URL: {url}")
                return
            
            # Update status to processing
            document.processing_status = ProcessingStatus.PROCESSING
            db.commit()
            
            try:
                # Extract transcript
                transcript = await self.youtube_extractor.get_transcript(url)
                
                if not transcript:
                    document.processing_status = ProcessingStatus.FAILED
                    document.error_message = "Failed to extract transcript from YouTube video"
                    db.commit()
                    return
                
                # Update document with transcript
                document.content_preview = transcript[:500] + "..." if len(transcript) > 500 else transcript
                document.word_count = len(transcript.split())
                document.doc_metadata = {
                    "source": "youtube",
                    "url": url,
                    "transcript_length": len(transcript)
                }
                
                # Get space for namespace
                space = db.query(Space).filter(Space.id == space_id).first()
                if not space:
                    raise ValueError("Space not found")
                
                # Process and store content
                chunks = self.text_splitter.split_text(transcript)
                
                # Prepare content in the format expected by vector service
                content = []
                for i, chunk in enumerate(chunks):
                    content.append({
                        "content": chunk,
                        "metadata": {
                            "namespace": space.vector_namespace,
                            "title": document.title,
                            "type": "youtube_transcript",
                            "chunk_index": i,
                            "document_id": str(document.id),
                            "space_id": str(space_id)
                        }
                    })
                
                # Store in vector database
                if self.vector_service.pinecone_available:
                    document_metadata = {
                        "document_id": str(document.id),
                        "title": document.title,
                        "content_type": "youtube_transcript",
                        "space_id": str(space_id)
                    }
                    
                    vector_result = await self.vector_service.store_embeddings(
                        content=content,
                        namespace=space.vector_namespace,
                        document_metadata=document_metadata
                    )
                    
                    document.vector_ids = vector_result.get("vector_ids", [])
                    document.chunk_count = len(chunks)
                else:
                    logger.warning("Vector service not available, skipping vector storage")
                    document.vector_ids = []
                    document.chunk_count = len(chunks)
                
                # Update status to completed
                document.processing_status = ProcessingStatus.COMPLETED
                document.processed_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Successfully processed YouTube URL: {url}")
                
            except Exception as e:
                logger.error(f"Error processing YouTube URL {url}: {str(e)}")
                document.processing_status = ProcessingStatus.FAILED
                document.error_message = str(e)
                db.commit()
                
        finally:
            db.close()
    
    async def process_web_url(self, url: str, space_id: uuid.UUID):
        """Process web URL and extract content"""
        db = SessionLocal()
        try:
            # Find the document record
            document = db.query(Document).filter(
                Document.file_path == url,
                Document.space_id == space_id
            ).first()
            
            if not document:
                logger.error(f"Document not found for web URL: {url}")
                return
            
            # Update status to processing
            document.processing_status = ProcessingStatus.PROCESSING
            db.commit()
            
            try:
                # Extract web content
                content_text = await self.web_scraper.extract_content(url)
                
                if not content_text:
                    document.processing_status = ProcessingStatus.FAILED
                    document.error_message = "Failed to extract content from web page"
                    db.commit()
                    return
                
                # Update document with content
                document.content_preview = content_text[:500] + "..." if len(content_text) > 500 else content_text
                document.word_count = len(content_text.split())
                document.doc_metadata = {
                    "source": "web_page",
                    "url": url,
                    "content_length": len(content_text)
                }
                
                # Get space for namespace
                space = db.query(Space).filter(Space.id == space_id).first()
                if not space:
                    raise ValueError("Space not found")
                
                # Process and store content
                chunks = self.text_splitter.split_text(content_text)
                
                # Prepare content in the format expected by vector service
                content = []
                for i, chunk in enumerate(chunks):
                    content.append({
                        "content": chunk,
                        "metadata": {
                            "namespace": space.vector_namespace,
                            "title": document.title,
                            "type": "web_content",
                            "chunk_index": i,
                            "document_id": str(document.id),
                            "space_id": str(space_id)
                        }
                    })
                
                # Store in vector database
                if self.vector_service.pinecone_available:
                    document_metadata = {
                        "document_id": str(document.id),
                        "title": document.title,
                        "content_type": "web_content",
                        "space_id": str(space_id)
                    }
                    
                    vector_result = await self.vector_service.store_embeddings(
                        content=content,
                        namespace=space.vector_namespace,
                        document_metadata=document_metadata
                    )
                    
                    document.vector_ids = vector_result.get("vector_ids", [])
                    document.chunk_count = len(chunks)
                else:
                    logger.warning("Vector service not available, skipping vector storage")
                    document.vector_ids = []
                    document.chunk_count = len(chunks)
                
                # Update status to completed
                document.processing_status = ProcessingStatus.COMPLETED
                document.processed_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Successfully processed web URL: {url}")
                
            except Exception as e:
                logger.error(f"Error processing web URL {url}: {str(e)}")
                document.processing_status = ProcessingStatus.FAILED
                document.error_message = str(e)
                db.commit()
                
        finally:
            db.close() 