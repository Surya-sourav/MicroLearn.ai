from celery import Celery
from app.services.ingestion_service import IngestionService
import uuid

celery_app = Celery("micronotes")

@celery_app.task
async def process_document_task(document_id: str):
    """Background task to process uploaded documents"""
    ingestion_service = IngestionService()
    await ingestion_service.process_document(uuid.UUID(document_id))

@celery_app.task
async def process_url_task(url: str, space_id: str):
    """Background task to process web URLs"""
    ingestion_service = IngestionService()
    await ingestion_service.process_web_url(url, uuid.UUID(space_id))

@celery_app.task
async def process_youtube_task(url: str, space_id: str):
    """Background task to process YouTube URLs"""
    ingestion_service = IngestionService()
    await ingestion_service.process_youtube_url(url, uuid.UUID(space_id))