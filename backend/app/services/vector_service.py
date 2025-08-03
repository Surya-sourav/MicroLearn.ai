from typing import List, Dict, Any, Optional
from app.core.config import settings
from langchain_openai import OpenAIEmbeddings
from langchain_core.embeddings import Embeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import uuid

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        # Check if Pinecone credentials are available
        self.pinecone_available = bool(settings.PINECONE_API_KEY and settings.PINECONE_ENVIRONMENT)
        
        if not self.pinecone_available:
            logger.warning("Pinecone credentials not configured. Vector search will be disabled.")
            self.embeddings = None
            self.index = None
            self.vectorstore = None
            return
        
        try:
            # Initialize embeddings
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-ada-002",
                openai_api_key=settings.OPENAI_API_KEY
            )
            
            # Initialize Pinecone client
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            
            # Create index if it doesn't exist
            index_name = settings.PINECONE_INDEX_NAME
            try:
                existing_indexes = pc.list_indexes().names()
                
                if index_name not in existing_indexes:
                    logger.info(f"Creating Pinecone index: {index_name}")
                    pc.create_index(
                        name=index_name,
                        dimension=1536,  # OpenAI text-embedding-3-small embedding dimension
                        metric='cosine',
                        spec=ServerlessSpec(
                            cloud='aws',
                            region='us-east-1'
                        )
                    )
                    # Wait for index to be ready
                    import time
                    time.sleep(5)
                
                # Get index
                self.index = pc.Index(index_name)
                
                # Initialize LangChain vectorstore
                self.vectorstore = PineconeVectorStore(
                    index=self.index,
                    embedding=self.embeddings,
                    text_key="text"
                )
                
                logger.info("Pinecone initialized successfully")
                
            except Exception as pinecone_error:
                logger.error(f"Pinecone initialization failed: {pinecone_error}")
                # Fall back to no vector search
                self.pinecone_available = False
                self.embeddings = None
                self.index = None
                self.vectorstore = None
                
        except Exception as e:
            logger.error(f"Failed to initialize embeddings or Pinecone: {e}")
            self.pinecone_available = False
            self.embeddings = None
            self.index = None
            self.vectorstore = None

    def _flatten_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        flattened = {}
        
        def flatten(obj: Any, prefix: str = ""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    new_prefix = f"{prefix}_{key}" if prefix else key
                    flatten(value, new_prefix)
            elif isinstance(obj, (str, int, float, bool)) or obj is None:
                flattened[prefix] = str(obj) if obj is not None else ""
            elif isinstance(obj, list):
                # Convert list to comma-separated string
                flattened[prefix] = ",".join(str(x) for x in obj)
            else:
                # Convert any other type to string
                flattened[prefix] = str(obj)
        
        flatten(metadata)
        return flattened

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def store_embeddings(
        self,
        content: List[Dict[str, Any]],
        namespace: str,
        document_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Store text embeddings in vector database"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available. Skipping vector storage.")
            return {
                "vector_ids": [],
                "total_vectors": 0,
                "chunks_metadata": [],
                "status": "skipped_no_pinecone"
            }
        
        try:
            logger.info("Starting to store embeddings")
            chunks_metadata = []
            texts = []
            metadatas = []
            
            # Process each content element
            for element in content:
                element_text = element.get("content")
                if not element_text or not element_text.strip():
                    continue
                
                # Prepare metadata
                metadata = {
                    "text": element_text,
                    "namespace": namespace,
                    **element.get("metadata", {}),
                    **document_metadata
                }
                
                # Clean and flatten metadata
                metadata = {
                    k: str(v) if isinstance(v, (uuid.UUID, bytes)) else v
                    for k, v in metadata.items()
                    if v is not None
                }
                metadata = self._flatten_metadata(metadata)
                
                texts.append(element_text)
                metadatas.append(metadata)
                chunks_metadata.append(metadata)
            
            # Batch add to Pinecone through LangChain
            vector_ids = []
            if texts:
                logger.info(f"Adding {len(texts)} chunks to vector store")
                await asyncio.sleep(0.5)  # Rate limiting
                vector_ids = self.vectorstore.add_texts(texts=texts, metadatas=metadatas)
                logger.info(f"Successfully stored embeddings with IDs: {len(vector_ids) if vector_ids else 0}")
            
            # Add vector IDs to chunks metadata
            for i, chunk_meta in enumerate(chunks_metadata):
                if i < len(vector_ids):
                    chunk_meta["vector_id"] = vector_ids[i]
            
            return {
                "total_vectors": len(texts),
                "chunks_metadata": chunks_metadata,
                "vector_ids": vector_ids
            }
            
        except Exception as e:
            logger.error(f"Error storing embeddings: {str(e)}")
            raise
    
    async def similarity_search(
        self,
        query: str,
        namespace: str,
        top_k: int = 5,
        filter: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available. Returning empty search results.")
            return []
        
        try:
            # Set namespace and perform search
            self.vectorstore._namespace = namespace
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=top_k,
                filter=filter,
                namespace=namespace
            )
            
            logger.info(f"Raw results count: {len(results)}")
            
            # Process results
            search_results = []
            for doc, score in results:
                if doc.metadata:
                    search_results.append({
                        "text": doc.page_content,
                        "score": score,
                        "metadata": {
                            k: v for k, v in doc.metadata.items()
                            if k != "text"
                        }
                    })
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error in similarity search: {str(e)}")
            return []
    
    async def delete_vectors(
        self,
        namespace: str,
        ids: Optional[List[str]] = None
    ):
        """Delete vectors by IDs or entire namespace"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available. Skipping vector deletion.")
            return
        
        try:
            if ids:
                # Delete specific vectors
                self.index.delete(ids=ids, namespace=namespace)
            else:
                # Delete all vectors in namespace
                self.index.delete(delete_all=True, namespace=namespace)
            logger.info(f"Successfully deleted vectors in namespace: {namespace}")
        except Exception as e:
            logger.error(f"Error deleting vectors: {str(e)}")
            logger.warning("Continuing without vector deletion")
