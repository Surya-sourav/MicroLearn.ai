from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
import logging
from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.space import Space
from app.models.document import Document, ContentType
from app.schemas.document import Document as DocumentSchema
from app.services.ingestion_service import IngestionService
from app.models.document import ProcessingStatus

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/spaces/{space_id}/upload", response_model=DocumentSchema)
async def upload_document(
    space_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Starting document upload process for file: {file.filename}")
    
    try:
        # Verify space ownership
        space = db.query(Space).filter(
            Space.id == space_id,
            Space.owner_id == current_user.id
        ).first()
        
        if not space:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Space not found"
            )
        
        # Check file size
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large"
            )
        
        # Determine content type
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension == 'pdf':
            content_type = ContentType.PDF
        elif file_extension in ['docx', 'doc']:
            content_type = ContentType.DOCX
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type"
            )
        
        logger.info(f"Saving file to disk: {file.filename}")
        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create document record with initial status
        document = Document(
            title=file.filename,
            content_type=content_type,
            file_path=file_path,
            space_id=space_id,
            processing_status=ProcessingStatus.PENDING,  # Set initial status
            vector_ids=[],  # Initialize empty list
            chunk_count=0,  # Initialize count
            doc_metadata=None,
            doc_structure=None,
            extracted_tables=None,
            extracted_images=None,
            word_count=None,
            page_count=None,
            table_count=None,
            image_count=None,
            processed_at=None,
            error_message=None
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        logger.info(f"Starting ingestion process for document ID: {document.id}")
        # Enable ingestion process
        ingestion_service = IngestionService()
        try:
            await ingestion_service.process_document(document.id)
            logger.info(f"Document processing completed successfully: {document.id}")
        except Exception as e:
            logger.error(f"Error processing document {document.id}. Error type: {type(e).__name__}. Error details: {str(e)}")
            logger.exception("Full traceback:")
            document.processing_status = ProcessingStatus.FAILED
            document.error_message = f"{type(e).__name__}: {str(e)}"
            db.commit()
        
        # Refresh document to get latest state
        db.refresh(document)
        return document
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_document: {type(e).__name__} - {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing upload: {str(e)}"
        )

@router.post("/spaces/{space_id}/url", response_model=DocumentSchema)
async def add_url(
    space_id: uuid.UUID,
    url: str = Form(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    # Determine content type
    if "youtube.com" in url or "youtu.be" in url:
        content_type = ContentType.YOUTUBE
        title = "YouTube Video"  # You might want to fetch actual title
    else:
        content_type = ContentType.WEB_PAGE
        title = "Web Page"  # You might want to fetch actual title
    
    # Create document record
    document = Document(
        title=title,
        content_type=content_type,
        space_id=space_id,
        file_path=url,  # Store URL as file_path for web content
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Comment out background processing for now
    # ingestion_service = IngestionService()
    # if content_type == ContentType.YOUTUBE:
    #     await ingestion_service.process_youtube_url(url, space_id)
    # else:
    #     await ingestion_service.process_web_url(url, space_id)
    
    return document

@router.get("/spaces/{space_id}/documents", response_model=List[DocumentSchema])
async def get_documents(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    documents = db.query(Document).filter(Document.space_id == space_id).all()
    return documents

@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).join(Space).filter(
        Document.id == document_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file if exists
    if document.file_path and os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
