#!/usr/bin/env python3
"""
Integration test for YouTube processing in the application context
"""

import asyncio
import sys
import os
import uuid

# Add the app directory to the path
sys.path.append('/app')

from app.services.ingestion_service import IngestionService
from app.core.database import SessionLocal
from app.models.document import Document, ContentType, ProcessingStatus
from app.models.space import Space
from app.models.user import User

async def test_youtube_integration():
    """Test YouTube processing in the full application context"""
    print("🧪 Testing YouTube Integration in Application Context...")
    
    # Test URL
    test_url = "https://youtu.be/-pqzyvRp3Tc?si=Gw3xtJ7dV1AKL9JB"
    
    # Get a test space (first available)
    db = SessionLocal()
    try:
        space = db.query(Space).first()
        if not space:
            print("❌ No spaces found in database")
            return
        
        print(f"✅ Using space: {space.name} (ID: {space.id})")
        
        # Create a test document record
        document = Document(
            title="Test YouTube Video",
            content_type=ContentType.YOUTUBE,
            file_path=test_url,
            space_id=space.id,
            processing_status=ProcessingStatus.PENDING
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        print(f"✅ Created test document: {document.id}")
        
        # Test the ingestion service
        ingestion_service = IngestionService()
        
        print(f"🔍 Processing YouTube URL: {test_url}")
        try:
            await ingestion_service.process_youtube_url(test_url, space.id)
            
            # Check the result
            db.refresh(document)
            
            if document.processing_status == ProcessingStatus.COMPLETED:
                print(f"✅ Success! Document status: {document.processing_status}")
                print(f"📝 Content preview: {document.content_preview[:200]}...")
                print(f"📊 Word count: {document.word_count}")
                print(f"🔢 Chunk count: {document.chunk_count}")
                print(f"🎯 Vector IDs: {len(document.vector_ids) if document.vector_ids else 0}")
            else:
                print(f"❌ Failed! Document status: {document.processing_status}")
                print(f"❌ Error message: {document.error_message}")
                
        except Exception as e:
            print(f"❌ Error during processing: {e}")
            import traceback
            traceback.print_exc()
        
        # Clean up
        db.delete(document)
        db.commit()
        print("🧹 Cleaned up test document")
        
    finally:
        db.close()

async def main():
    """Main test function"""
    print("🚀 Starting YouTube Integration Test...")
    
    await test_youtube_integration()
    
    print("\n✅ Integration test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 