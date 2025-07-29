# import os
# import asyncio
# from typing import List, Dict, Any
# import uuid
# from datetime import datetime
# import logging
# from sqlalchemy.orm import Session
# from app.core.database import SessionLocal
# from app.models.document import Document, ProcessingStatus
# from app.models.space import Space
# from app.services.vector_service import VectorService
# # from app.services.content_extraction_service import ContentExtractionService
# from app.utils.document_parser import DocumentParser
# import re
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# import tiktoken

# logger = logging.getLogger(__name__)

# class IngestionService:
#     def __init__(self):
#         self.vector_service = VectorService()
#         self.document_parser = DocumentParser()
#         # self.content_extraction = ContentExtractionService()
        
#         # Initialize text splitter
#         self.text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=500,
#             chunk_overlap=50,
#             length_function=self._count_tokens,
#             separators=["\n\n", "\n", " ", ""]
#         )
    
#     def _count_tokens(self, text: str) -> int:
#         """Count tokens using tiktoken"""
#         enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
#         return len(enc.encode(text))
    
#     async def process_document(self, document_id: uuid.UUID):
#         """Process uploaded document and store in vector database"""
#         db = SessionLocal()
#         try:
#             document = db.query(Document).filter(Document.id == document_id).first()
#             if not document:
#                 logger.error(f"Document {document_id} not found")
#                 return
            
#             # Update status to processing
#             document.processing_status = ProcessingStatus.PROCESSING
#             db.commit()
            
#             try:
#                 # Extract text and metadata based on content type
#                 if document.content_type.value == 'pdf':
#                     # Extract text and basic metadata
#                     extraction_result = self.document_parser.extract_pdf_text(document.file_path)
                    
#                     # Extract tables, images, and analyze structure
#                     # document_structure = await self.content_extraction.analyze_document_structure(
#                     #     document.file_path
#                     # )
                    
#                     # Store document metadata and structure
#                     document.doc_metadata = extraction_result["metadata"]
#                     document.doc_structure = document_structure
#                     document.extracted_tables = document_structure["tables"]["content"]
#                     document.extracted_images = document_structure["images"]["content"]
                    
#                     # Update statistics
#                     document.table_count = document_structure["tables"]["count"]
#                     document.image_count = document_structure["images"]["count"]
#                     document.page_count = extraction_result["metadata"].get("pages", 0)
                    
#                     # Set preview from first meaningful content
#                     document.content_preview = (
#                         extraction_result["content"][0]["content"][:500] 
#                         if extraction_result["content"] 
#                         else ""
#                     )
                    
#                     # Get space for namespace
#                     space = db.query(Space).filter(Space.id == document.space_id).first()
#                     if not space:
#                         raise ValueError("Space not found")
                    
#                     # Find related documents
#                     related_docs = await self._find_related_documents(document, space, db)
                    
#                     # Prepare base metadata
#                     base_metadata = {
#                         "document_id": str(document.id),
#                         "title": document.title,
#                         "content_type": document.content_type.value,
#                         "created_at": document.created_at.isoformat(),
#                         "space_id": str(document.space_id),
#                         "related_documents": related_docs,
#                         **extraction_result["metadata"]
#                     }
                    
#                     # Process and store different content types
#                     vector_results = []
                    
#                     # Process text content
#                     for content_item in extraction_result["content"]:
#                         # Split into chunks
#                         chunks = self.text_splitter.split_text(content_item["content"])
                        
#                         # Prepare chunks with metadata
#                         chunk_contents = []
#                         for i, chunk in enumerate(chunks):
#                             chunk_contents.append({
#                                 "content": chunk,
#                                 "type": "text",
#                                 "metadata": {
#                                     **base_metadata,
#                                     "chunk_index": i,
#                                     "section": content_item.get("section"),
#                                     "page_number": content_item.get("metadata", {}).get("page_number"),
#                                     "category": content_item.get("metadata", {}).get("category")
#                                 }
#                             })
                        
#                         # Store chunks
#                         text_result = await self.vector_service.store_embeddings(
#                             content=chunk_contents,
#                             namespace=space.vector_namespace,
#                             document_metadata=base_metadata
#                         )
#                         vector_results.append(text_result)
                    
#                     # Store table content if present
#                     if document.has_tables:
#                         table_content = []
#                         for table in document.extracted_tables:
#                             # Convert table data to text
#                             headers = table["headers"]
#                             rows = table["data"]
#                             table_text = f"Table {table['table_number']} Headers: {', '.join(headers)}\n"
#                             for row in rows:
#                                 table_text += f"Row: {', '.join(str(v) for v in row.values())}\n"
                            
#                             # Split table text into chunks
#                             table_chunks = self.text_splitter.split_text(table_text)
                            
#                             for i, chunk in enumerate(table_chunks):
#                                 table_content.append({
#                                     "content": chunk,
#                                     "type": "table",
#                                     "metadata": {
#                                         **base_metadata,
#                                         "table_number": table["table_number"],
#                                         "chunk_index": i,
#                                         "page": table.get("page")
#                                     }
#                                 })
                        
#                         table_result = await self.vector_service.store_embeddings(
#                             content=table_content,
#                             namespace=space.vector_namespace,
#                             document_metadata=base_metadata
#                         )
#                         vector_results.append(table_result)
                    
#                     # Store image content if present
#                     if document.has_images:
#                         image_content = []
#                         for image in document.extracted_images:
#                             # Combine image metadata and OCR text
#                             image_text = f"Image Description: {image['classification']['label']}\n"
#                             if image['ocr_text']:
#                                 image_text += f"Image Text: {image['ocr_text']}\n"
                            
#                             # Split image text into chunks
#                             image_chunks = self.text_splitter.split_text(image_text)
                            
#                             for i, chunk in enumerate(image_chunks):
#                                 image_content.append({
#                                     "content": chunk,
#                                     "type": "image",
#                                     "metadata": {
#                                         **base_metadata,
#                                         "image_path": image["image_path"],
#                                         "classification": image["classification"],
#                                         "position": image["position"],
#                                         "chunk_index": i,
#                                         "page_number": image["page_number"]
#                                     }
#                                 })
                        
#                         image_result = await self.vector_service.store_embeddings(
#                             content=image_content,
#                             namespace=space.vector_namespace,
#                             document_metadata=base_metadata
#                         )
#                         vector_results.append(image_result)
                    
#                     # Update document with vector info
#                     document.vector_ids = []
#                     document.chunk_count = 0
#                     for result in vector_results:
#                         document.vector_ids.extend([
#                             meta.get("id") for meta in result["chunks_metadata"]
#                         ])
#                         document.chunk_count += result["total_vectors"]
                    
#                     # Calculate word count from all chunks
#                     document.word_count = sum(
#                         len(chunk["content"].split())
#                         for result in vector_results
#                         for chunk in result["chunks_metadata"]
#                     )
                    
#                     # Mark as completed
#                     document.processing_status = ProcessingStatus.COMPLETED
#                     document.processed_at = datetime.utcnow()
                    
#                 else:
#                     raise ValueError(f"Unsupported content type: {document.content_type}")
                
#             except Exception as e:
#                 logger.error(f"Error processing document {document_id}: {str(e)}")
#                 document.processing_status = ProcessingStatus.FAILED
#                 document.error_message = str(e)
#                 raise
            
#             finally:
#                 db.commit()
                
#         except Exception as e:
#             logger.error(f"Error in process_document: {str(e)}")
#             raise
            
#         finally:
#             db.close()
    
#     async def _find_related_documents(
#         self,
#         document: Document,
#         space: Space,
#         db: Session
#     ) -> List[Dict[str, Any]]:
#         """Find related documents using various methods"""
#         try:
#             related = []
            
#             # Find similar documents using vector similarity
#             if document.content_preview:
#                 similar = await self.vector_service.similarity_search(
#                     query=document.content_preview,
#                     namespace=space.vector_namespace,
#                     top_k=5,
#                     filter={
#                         "document_id": {"$ne": str(document.id)}  # Exclude self
#                     }
#                 )
                
#                 for result in similar:
#                     if result["score"] > 0.7:  # Minimum similarity threshold
#                         related.append({
#                             "document_id": result["metadata"]["document_id"],
#                             "title": result["metadata"]["title"],
#                             "relationship_type": "similar",
#                             "similarity_score": result["score"]
#                         })
            
#             # Find documents with similar titles
#             title_pattern = re.compile(r'[^\w\s]')
#             clean_title = title_pattern.sub('', document.title.lower())
#             title_parts = set(clean_title.split())
            
#             space_docs = db.query(Document).filter(
#                 Document.space_id == space.id,
#                 Document.id != document.id,
#                 Document.processing_status == "completed"
#             ).all()
            
#             for doc in space_docs:
#                 clean_doc_title = title_pattern.sub('', doc.title.lower())
#                 doc_parts = set(clean_doc_title.split())
                
#                 # Check for title similarity
#                 overlap = len(title_parts.intersection(doc_parts))
#                 if overlap >= 2:  # At least 2 words in common
#                     related.append({
#                         "document_id": str(doc.id),
#                         "title": doc.title,
#                         "relationship_type": "related_title",
#                         "similarity_score": overlap / len(title_parts.union(doc_parts))
#                     })
                
#                 # Check for version/sequence relationships
#                 version_pattern = r'v(\d+(?:\.\d+)*)'
#                 doc_version = re.search(version_pattern, doc.title)
#                 current_version = re.search(version_pattern, document.title)
                
#                 if doc_version and current_version:
#                     if doc_version.group(1) < current_version.group(1):
#                         related.append({
#                             "document_id": str(doc.id),
#                             "title": doc.title,
#                             "relationship_type": "previous_version",
#                             "version": doc_version.group(1)
#                         })
            
#             return related
            
#         except Exception as e:
#             logger.error(f"Error finding related documents: {str(e)}")
#             return []
    
#     async def reprocess_document(self, document_id: uuid.UUID):
#         """Reprocess an existing document"""
#         db = SessionLocal()
#         try:
#             document = db.query(Document).filter(Document.id == document_id).first()
#             if not document:
#                 raise ValueError(f"Document {document_id} not found")
            
#             # Delete existing vectors if any
#             if document.vector_ids:
#                 space = db.query(Space).filter(Space.id == document.space_id).first()
#                 if space:
#                     await self.vector_service.delete_vectors(
#                         namespace=space.vector_namespace,
#                         ids=document.vector_ids
#                     )
            
#             # Reset document status and metadata
#             document.processing_status = ProcessingStatus.PENDING
#             document.vector_ids = []
#             document.chunk_count = 0
#             document.doc_metadata = None
#             document.doc_structure = None
#             document.extracted_tables = None
#             document.extracted_images = None
#             document.word_count = None
#             document.page_count = None
#             document.table_count = None
#             document.image_count = None
#             document.processed_at = None
#             document.error_message = None
#             db.commit()
            
#             # Reprocess document
#             await self.process_document(document_id)
            
#         finally:
#             db.close()
    
#     async def delete_document(self, document_id: uuid.UUID):
#         """Delete document and its vectors"""
#         db = SessionLocal()
#         try:
#             document = db.query(Document).filter(Document.id == document_id).first()
#             if not document:
#                 return
            
#             # Delete vectors if any
#             if document.vector_ids:
#                 space = db.query(Space).filter(Space.id == document.space_id).first()
#                 if space:
#                     await self.vector_service.delete_vectors(
#                         namespace=space.vector_namespace,
#                         ids=document.vector_ids
#                     )
            
#             # Delete extracted images if any
#             if document.has_images:
#                 image_dir = os.path.join(os.path.dirname(document.file_path), 'images')
#                 if os.path.exists(image_dir):
#                     for image in document.extracted_images:
#                         image_path = image.get('image_path')
#                         if image_path and os.path.exists(image_path):
#                             os.remove(image_path)
#                     os.rmdir(image_dir)
            
#             # Delete file
#             if os.path.exists(document.file_path):
#                 os.remove(document.file_path)
            
#             # Delete document record
#             db.delete(document)
#             db.commit()
            
#         finally:
#             db.close()
