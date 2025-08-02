#!/usr/bin/env python3
"""
Test script to verify Flashcard Generation functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.flashcard_service import FlashcardService
from app.core.database import SessionLocal
from app.models.document import Document
from app.models.space import Space
import uuid

async def test_flashcard_generation():
    """Test Flashcard Generation functionality"""
    print("🔍 Testing Flashcard Generation...")
    
    flashcard_service = FlashcardService()
    
    # Get a document from the database
    db = SessionLocal()
    try:
        # Find a document with content
        document = db.query(Document).filter(
            Document.content_preview.isnot(None),
            Document.content_preview != ""
        ).first()
        
        if not document:
            print("   ❌ No documents with content found in database")
            return
        
        print(f"   Testing with document: {document.title}")
        print(f"   Document ID: {document.id}")
        print(f"   Space ID: {document.space_id}")
        
        # Test 1: Generate flashcards for document
        print("\n   🔄 Generating flashcards for document...")
        try:
            flashcards = await flashcard_service.generate_flashcards_for_document(
                document_id=document.id,
                count=3
            )
            
            print(f"   ✅ Successfully generated {len(flashcards)} flashcards")
            
            # Display the flashcards
            for i, flashcard in enumerate(flashcards, 1):
                print(f"   Flashcard {i}:")
                print(f"     Question: {flashcard.question}")
                print(f"     Answer: {flashcard.answer}")
                print(f"     Difficulty: {flashcard.difficulty}")
                print(f"     Tags: {flashcard.tags}")
                print()
                
        except Exception as e:
            print(f"   ❌ Flashcard generation failed: {e}")
            import traceback
            traceback.print_exc()
        
        # Test 2: Generate flashcards for space
        print("\n   🔄 Generating flashcards for space...")
        try:
            space_flashcards = await flashcard_service.generate_flashcards_for_space(
                space_id=document.space_id,
                count=2
            )
            
            print(f"   ✅ Successfully generated {len(space_flashcards)} flashcards for space")
            
        except Exception as e:
            print(f"   ❌ Space flashcard generation failed: {e}")
            import traceback
            traceback.print_exc()
            
    finally:
        db.close()

async def main():
    """Run flashcard generation test"""
    print("🚀 Starting Flashcard Generation Test...\n")
    
    await test_flashcard_generation()
    
    print("\n✅ Flashcard generation test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 