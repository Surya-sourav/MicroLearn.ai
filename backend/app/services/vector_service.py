from typing import List, Dict, Any, Optional
from app.core.config import settings
from langchain_openai import OpenAIEmbeddings
from langchain_core.embeddings import Embeddings
from langchain_community.vectorstores import Pinecone
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import uuid

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        # Initialize embeddings
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-ada-002",
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        # Initialize LangChain vectorstore
        self.vectorstore = Pinecone.from_existing_index(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=self.embeddings,
            text_key="text",
            namespace=None  # Will be set per operation
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
            chunks_metadata = []
            texts = []
            metadatas = []
            
            # Process each content element
            for element in content:
                element_text = element["content"]
                if not element_text.strip():
                    continue
                
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
                
                texts.append(element_text)
                metadatas.append(metadata)
                chunks_metadata.append(metadata)
            
            # Batch add to Pinecone through LangChain
            if texts:
                self.vectorstore._namespace = namespace
                await asyncio.sleep(0.5)  # Rate limiting
                self.vectorstore.add_texts(texts=texts, metadatas=metadatas)
            
            return {
                "total_vectors": len(texts),
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
            self.vectorstore._namespace = namespace
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=top_k,
                filter=filter
            )
            
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
            raise
    
    async def delete_vectors(
        self,
        namespace: str,
        ids: Optional[List[str]] = None
    ):
        """Delete vectors by IDs or entire namespace"""
        try:
            self.vectorstore._namespace = namespace
            if ids:
                self.vectorstore.delete(ids=ids)
            else:
                self.vectorstore.delete_namespace(namespace)
        except Exception as e:
            logger.error(f"Error deleting vectors: {str(e)}")
            raise
