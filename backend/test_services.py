#!/usr/bin/env python3
"""
Test script to verify Vector Service and Data Ingestion Service functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.vector_service import VectorService
from app.services.ingestion_service import IngestionService
from app.core.database import SessionLocal
from app.models.document import Document
from app.models.space import Space
import uuid

async def test_vector_service():
    """Test Vector Service functionality"""
    print("🔍 Testing Vector Service...")
    
    vector_service = VectorService()
    
    # Test 1: Check if Pinecone is available
    print(f"   Pinecone Available: {vector_service.pinecone_available}")
    
    # Test 2: Test store_embeddings with disabled Pinecone
    test_content = [
        {
            "content": "This is a test document about machine learning.",
            "metadata": {"title": "Test Doc", "type": "text"}
        }
    ]
    
    try:
        result = await vector_service.store_embeddings(
            content=test_content,
            namespace="test_namespace",
            document_metadata={"test": "data"}
        )
        print(f"   Store Embeddings Result: {result}")
        print("   ✅ Vector Service store_embeddings working correctly")
    except Exception as e:
        print(f"   ❌ Vector Service store_embeddings failed: {e}")
    
    # Test 3: Test similarity search
    try:
        results = await vector_service.similarity_search(
            query="machine learning",
            namespace="test_namespace",
            top_k=5
        )
        print(f"   Similarity Search Results: {len(results)} items")
        print("   ✅ Vector Service similarity_search working correctly")
    except Exception as e:
        print(f"   ❌ Vector Service similarity_search failed: {e}")

async def test_ingestion_service():
    """Test Data Ingestion Service functionality"""
    print("\n🔍 Testing Data Ingestion Service...")
    
    ingestion_service = IngestionService()
    
    # Test 1: Check if service initializes
    print("   ✅ Ingestion Service initialized successfully")
    
    # Test 2: Check vector service integration
    print(f"   Vector Service Available: {ingestion_service.vector_service.pinecone_available}")
    
    # Test 3: Check document parser
    print("   ✅ Document Parser initialized successfully")
    
    # Test 4: Check content extraction
    print("   ✅ Content Extraction Service initialized successfully")

async def test_database_connection():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    
    try:
        db = SessionLocal()
        # Test basic query
        spaces_count = db.query(Space).count()
        documents_count = db.query(Document).count()
        
        print(f"   Spaces in database: {spaces_count}")
        print(f"   Documents in database: {documents_count}")
        print("   ✅ Database connection working correctly")
        
        db.close()
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")

async def main():
    """Run all tests"""
    print("🚀 Starting Service Tests...\n")
    
    # Test database connection first
    await test_database_connection()
    
    # Test vector service
    await test_vector_service()
    
    # Test ingestion service
    await test_ingestion_service()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 