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
from app.services.vector_service import VectorService
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
    
    # Process URL in background
    ingestion_service = IngestionService()
    if content_type == ContentType.YOUTUBE:
        await ingestion_service.process_youtube_url(url, space_id)
    else:
        await ingestion_service.process_web_url(url, space_id)
    
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

@router.get("/spaces/{space_id}/summary")
async def get_space_summary(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a summary of documents in a space before clearing"""
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
    
    # Get document statistics
    documents = db.query(Document).filter(Document.space_id == space_id).all()
    
    # Group by status
    status_counts = {}
    total_size = 0
    file_count = 0
    
    for doc in documents:
        status = doc.processing_status.value if doc.processing_status else "unknown"
        status_counts[status] = status_counts.get(status, 0) + 1
        
        # Count files (not URLs)
        if (doc.file_path and 
            not doc.file_path.startswith(('http://', 'https://')) and
            os.path.exists(doc.file_path)):
            file_count += 1
            try:
                total_size += os.path.getsize(doc.file_path)
            except:
                pass
    
    return {
        "space_id": str(space_id),
        "space_name": space.name,
        "vector_namespace": space.vector_namespace,
        "total_documents": len(documents),
        "status_breakdown": status_counts,
        "files_on_disk": file_count,
        "total_file_size_mb": round(total_size / (1024 * 1024), 2),
        "documents": [
            {
                "id": str(doc.id),
                "title": doc.title,
                "status": doc.processing_status.value if doc.processing_status else "unknown",
                "chunks": doc.chunk_count or 0,
                "type": doc.content_type.value if doc.content_type else "unknown"
            }
            for doc in documents
        ]
    }

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

@router.delete("/spaces/{space_id}/clear")
async def clear_space_documents(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all documents from a space - useful for cleaning up old uploads"""
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
        
        # Get all documents in the space
        documents = db.query(Document).filter(Document.space_id == space_id).all()
        deleted_count = len(documents)
        
        # Delete vector embeddings for this space
        try:
            vector_service = VectorService()
            if space.vector_namespace:
                await vector_service.delete_vectors(namespace=space.vector_namespace)
        except Exception as e:
            logger.warning(f"Error clearing vectors for space {space_id}: {str(e)}")
        
        # Delete files and documents
        deleted_files = 0
        for document in documents:
            try:
                # Delete physical file if it exists and is not a URL
                if (document.file_path and 
                    os.path.exists(document.file_path) and
                    not document.file_path.startswith(('http://', 'https://'))):
                    os.remove(document.file_path)
                    deleted_files += 1
            except Exception as e:
                logger.warning(f"Error deleting file {document.file_path}: {str(e)}")
            
            # Delete document from database
            db.delete(document)
        
        # Commit all deletions
        db.commit()
        
        return {
            "message": f"Successfully cleared space '{space.name}'",
            "deleted_documents": deleted_count,
            "deleted_files": deleted_files,
            "space_id": str(space_id),
            "space_name": space.name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing space {space_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing space: {str(e)}"
        )
