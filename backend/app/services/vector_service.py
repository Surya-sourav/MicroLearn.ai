import pinecone
from typing import List, Dict, Any, Optional
from app.core.config import settings
from langchain_openai import OpenAIEmbeddings
from langchain_core.embeddings import Embeddings
from langchain_community.vectorstores import Pinecone as LangchainPinecone
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import json
import uuid

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        # Initialize Pinecone
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        self.index = pinecone.Index(settings.PINECONE_INDEX_NAME)
        
        # Initialize embeddings
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-ada-002",
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        # Initialize LangChain vectorstore
        self.vectorstore = LangchainPinecone(
            index=self.index,
            embedding_function=self.embeddings,
            text_key="text"
        )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def store_embeddings(
        self,
        content: List[Dict[str, Any]],
        namespace: str,
        document_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Store text embeddings in vector database"""
        try:
            all_vectors = []
            chunks_metadata = []
            
            # Process each content element
            for element in content:
                element_text = element["content"]
                if not element_text.strip():
                    continue
                
                # Generate embeddings
                embedding = await self.embeddings.aembed_query(element_text)
                
                # Prepare metadata
                metadata = {
                    "text": element_text,
                    "namespace": namespace,
                    **element.get("metadata", {}),
                    **document_metadata
                }
                
                # Clean metadata
                metadata = {
                    k: str(v) if isinstance(v, (uuid.UUID, bytes)) else v
                    for k, v in metadata.items()
                    if v is not None
                }
                
                vector_id = f"{namespace}_{len(all_vectors)}_{hash(element_text[:50])}"
                
                all_vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
                chunks_metadata.append(metadata)
            
            # Batch upsert to Pinecone
            batch_size = 100
            for i in range(0, len(all_vectors), batch_size):
                batch = all_vectors[i:i + batch_size]
                await asyncio.sleep(0.5)  # Rate limiting
                self.index.upsert(vectors=batch, namespace=namespace)
            
            return {
                "total_vectors": len(all_vectors),
                "chunks_metadata": chunks_metadata
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
        try:
            # Generate query embedding
            query_embedding = await self.embeddings.aembed_query(query)
            
            # Search in Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=namespace,
                include_metadata=True,
                filter=filter
            )
            
            # Process results
            search_results = []
            for match in results.matches:
                if match.metadata:
                    search_results.append({
                        "text": match.metadata.get("text", ""),
                        "score": match.score,
                        "metadata": {
                            k: v for k, v in match.metadata.items()
                            if k != "text"
                        }
                    })
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error in similarity search: {str(e)}")
            raise
    
    async def delete_vectors(
        self,
        namespace: str,
        ids: Optional[List[str]] = None
    ):
        """Delete vectors by IDs or entire namespace"""
        try:
            if ids:
                self.index.delete(ids=ids, namespace=namespace)
            else:
                self.index.delete(delete_all=True, namespace=namespace)
        except Exception as e:
            logger.error(f"Error deleting vectors: {str(e)}")
            raise
