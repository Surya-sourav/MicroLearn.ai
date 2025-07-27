import pinecone
from typing import List, Dict, Any
from app.core.config import settings

class VectorService:
    def __init__(self):
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        self.index = pinecone.Index(settings.PINECONE_INDEX_NAME)
    
    async def store_embeddings(self, texts: List[str], namespace: str, metadata: List[Dict[str, Any]] = None):
        """Store text embeddings in vector database"""
        from openai import OpenAI
        
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Generate embeddings
        embeddings_response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=texts
        )
        
        embeddings = [data.embedding for data in embeddings_response.data]
        
        # Prepare vectors for upsert
        vectors = []
        for i, (text, embedding) in enumerate(zip(texts, embeddings)):
            vector_id = f"{namespace}_{i}_{hash(text[:50])}"
            vector_metadata = {"text": text, "namespace": namespace}
            if metadata and i < len(metadata):
                vector_metadata.update(metadata[i])
            
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": vector_metadata
            })
        
        # Upsert to Pinecone
        self.index.upsert(vectors=vectors, namespace=namespace)
        
        return len(vectors)
    
    async def similarity_search(self, query: str, namespace: str, top_k: int = 5) -> List[str]:
        """Search for similar documents"""
        from openai import OpenAI
        
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Generate query embedding
        query_embedding = client.embeddings.create(
            model="text-embedding-ada-002",
            input=[query]
        ).data[0].embedding
        
        # Search in Pinecone
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=namespace,
            include_metadata=True
        )
        
        # Extract text content
        context_docs = []
        for match in results.matches:
            if match.metadata and 'text' in match.metadata:
                context_docs.append(match.metadata['text'])
        
        return context_docs
    
    async def delete_namespace(self, namespace: str):
        """Delete all vectors in a namespace"""
        try:
            self.index.delete(delete_all=True, namespace=namespace)
        except Exception as e:
            print(f"Error deleting namespace {namespace}: {e}")
