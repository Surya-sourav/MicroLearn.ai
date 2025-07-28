import logging
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
import numpy as np
from app.services.vector_service import VectorService
from app.core.database import SessionLocal
from app.models.document import Document
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self):
        self.vector_service = VectorService()
        self._bm25_index = None
        self._corpus = None
        self._doc_mapping = None
        self.last_index_update = None
        self.index_ttl = timedelta(minutes=30)  # Rebuild BM25 index every 30 minutes
    
    async def _build_bm25_index(self):
        """Build BM25 index from documents"""
        try:
            db = SessionLocal()
            current_time = datetime.utcnow()
            
            # Check if we need to rebuild the index
            if (self._bm25_index is not None and 
                self.last_index_update is not None and 
                current_time - self.last_index_update < self.index_ttl):
                return
            
            # Get all completed documents
            documents = db.query(Document).filter(
                Document.processing_status == "completed"
            ).all()
            
            corpus = []
            doc_mapping = []
            
            for doc in documents:
                # Split content into sentences/paragraphs
                if doc.content_preview:
                    sentences = re.split(r'[.!?]+', doc.content_preview)
                    corpus.extend(sentences)
                    doc_mapping.extend([(doc.id, doc.title)] * len(sentences))
            
            # Tokenize and build BM25 index
            tokenized_corpus = [text.lower().split() for text in corpus]
            self._bm25_index = BM25Okapi(tokenized_corpus)
            self._corpus = corpus
            self._doc_mapping = doc_mapping
            self.last_index_update = current_time
            
        except Exception as e:
            logger.error(f"Error building BM25 index: {str(e)}")
            raise
            
        finally:
            db.close()
    
    async def hybrid_search(
        self,
        query: str,
        namespace: str = None,
        top_k: int = 5,
        hybrid_weight: float = 0.5,  # Weight between BM25 (0) and semantic search (1)
        filters: Optional[Dict] = None,
        rerank: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining BM25 and semantic search
        Args:
            query: Search query
            namespace: Vector DB namespace
            top_k: Number of results to return
            hybrid_weight: Weight between keyword and semantic search (0-1)
            filters: Metadata filters for vector search
            rerank: Whether to rerank results
        """
        try:
            # Ensure BM25 index is built
            await self._build_bm25_index()
            
            # Get BM25 scores
            tokenized_query = query.lower().split()
            bm25_scores = self._bm25_index.get_scores(tokenized_query)
            
            # Normalize BM25 scores
            bm25_scores = (bm25_scores - np.min(bm25_scores)) / (np.max(bm25_scores) - np.min(bm25_scores))
            
            # Get semantic search results
            semantic_results = await self.vector_service.similarity_search(
                query=query,
                namespace=namespace,
                top_k=top_k * 2,  # Get more results for reranking
                filter=filters
            )
            
            # Create mapping of document IDs to semantic scores
            semantic_scores = {}
            for result in semantic_results:
                doc_id = result['metadata'].get('document_id')
                if doc_id:
                    semantic_scores[doc_id] = result['score']
            
            # Combine scores
            combined_results = []
            seen_docs = set()
            
            # Process BM25 results
            for idx, score in enumerate(bm25_scores):
                doc_id, title = self._doc_mapping[idx]
                if doc_id not in seen_docs:
                    semantic_score = semantic_scores.get(doc_id, 0)
                    combined_score = (1 - hybrid_weight) * score + hybrid_weight * semantic_score
                    
                    combined_results.append({
                        'document_id': doc_id,
                        'title': title,
                        'text': self._corpus[idx],
                        'combined_score': combined_score,
                        'bm25_score': score,
                        'semantic_score': semantic_score
                    })
                    seen_docs.add(doc_id)
            
            # Sort by combined score
            combined_results.sort(key=lambda x: x['combined_score'], reverse=True)
            
            # Rerank if requested
            if rerank:
                combined_results = await self._rerank_results(query, combined_results[:top_k])
            else:
                combined_results = combined_results[:top_k]
            
            return combined_results
            
        except Exception as e:
            logger.error(f"Error in hybrid search: {str(e)}")
            raise
    
    async def _rerank_results(
        self,
        query: str,
        results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Rerank results using cross-attention between query and results
        """
        try:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
            
            # Load reranking model (e.g., cross-encoder)
            model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
            model = AutoModelForSequenceClassification.from_pretrained(model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Prepare pairs for reranking
            pairs = []
            for result in results:
                pairs.append([query, result['text']])
            
            # Get relevance scores
            features = tokenizer.batch_encode_plus(
                pairs,
                max_length=512,
                padding=True,
                truncation=True,
                return_tensors="pt"
            )
            
            relevance_scores = model(**features).logits.flatten().tolist()
            
            # Add relevance scores to results
            for result, score in zip(results, relevance_scores):
                result['relevance_score'] = score
            
            # Sort by relevance score
            results.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in reranking: {str(e)}")
            return results  # Return original results if reranking fails
    
    async def structured_search(
        self,
        query: str,
        content_type: Optional[str] = None,
        date_range: Optional[Dict[str, datetime]] = None,
        metadata_filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search with structured filters
        """
        try:
            filters = {}
            
            # Add content type filter
            if content_type:
                filters['content_type'] = content_type
            
            # Add date range filter
            if date_range:
                filters['created_at'] = {
                    '$gte': date_range.get('start').isoformat(),
                    '$lte': date_range.get('end').isoformat()
                }
            
            # Add metadata filters
            if metadata_filters:
                for key, value in metadata_filters.items():
                    filters[f"metadata.{key}"] = value
            
            # Perform hybrid search with filters
            results = await self.hybrid_search(
                query=query,
                filters=filters,
                rerank=True
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error in structured search: {str(e)}")
            raise 