import os
import logging
from typing import List, Dict, Any, Optional
from PyPDF2 import PdfReader
from PIL import Image
from pathlib import Path

logger = logging.getLogger(__name__)

class ContentExtractionService:
    def __init__(self):
        pass
        
    async def extract_text_and_metadata(self, pdf_path: str) -> Dict[str, Any]:
        
        try:
            logger.info(f"Starting text extraction from PDF: {pdf_path}")
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
                
            reader = PdfReader(pdf_path)
            content = []
            metadata = {
                "pages": len(reader.pages),
                "title": reader.metadata.get("/Title", ""),
                "author": reader.metadata.get("/Author", ""),
                "creation_date": reader.metadata.get("/CreationDate", ""),
                "producer": reader.metadata.get("/Producer", "")
            }
            
            logger.info(f"Found {len(reader.pages)} pages in PDF")
            for page_num, page in enumerate(reader.pages, 1):
                logger.debug(f"Processing page {page_num}")
                text = page.extract_text()
                if text.strip():
                    content.append({
                        "content": text,
                        "metadata": {
                            "page_number": page_num,
                            "category": "text"
                        }
                    })
                else:
                    logger.warning(f"Page {page_num} contains no text")
            
            logger.info(f"Successfully extracted text from {len(content)} pages")
            return {
                "metadata": metadata,
                "content": content
            }
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {type(e).__name__} - {str(e)}")
            logger.exception("Full traceback:")
            return {
                "metadata": {},
                "content": []
            }
    
    async def extract_images(self, pdf_path: str, output_dir: str) -> List[Dict[str, Any]]:
        
        try:
            logger.info(f"Starting image extraction from PDF: {pdf_path}")
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
                
            images = []
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True)
            
            reader = PdfReader(pdf_path)
            
            for page_num, page in enumerate(reader.pages, 1):
                logger.debug(f"Processing images on page {page_num}")
                for image_file_object in page.images:
                    try:
                        # Save image
                        image_path = output_path / f"page_{page_num}_{image_file_object.name}"
                        with open(image_path, "wb") as image_file:
                            image_file.write(image_file_object.data)
                        
                        # Analyze with PIL
                        with Image.open(image_path) as img:
                            width, height = img.size
                            format = img.format
                            mode = img.mode
                        
                        images.append({
                            "page_number": page_num,
                            "image_path": str(image_path),
                            "name": image_file_object.name,
                            "size": {
                                "width": width,
                                "height": height,
                                "aspect_ratio": width / height if height else 0
                            },
                            "format": format,
                            "mode": mode
                        })
                        logger.debug(f"Successfully extracted image: {image_file_object.name}")
                        
                    except Exception as img_error:
                        logger.error(f"Error processing image on page {page_num}: {type(img_error).__name__} - {str(img_error)}")
                        logger.exception("Full traceback:")
                        continue
            
            logger.info(f"Successfully extracted {len(images)} images")
            return images
            
        except Exception as e:
            logger.error(f"Error extracting images from PDF: {type(e).__name__} - {str(e)}")
            logger.exception("Full traceback:")
            return []
    
    async def analyze_document_structure(self, pdf_path: str) -> Dict[str, Any]:
        
        try:
            logger.info(f"Starting document structure analysis: {pdf_path}")
            
            # Extract text and metadata
            extraction_result = await self.extract_text_and_metadata(pdf_path)
            
            # Extract images
            images = await self.extract_images(pdf_path, os.path.join(os.path.dirname(pdf_path), 'images'))
            
            # Analyze document structure
            structure = {
                "metadata": extraction_result["metadata"],
                "content": extraction_result["content"],
                "images": {
                    "count": len(images),
                    "items": images
                }
            }
            
            logger.info(f"Document analysis complete. Found {len(extraction_result['content'])} text sections and {len(images)} images")
            return structure
            
        except Exception as e:
            logger.error(f"Error analyzing document structure: {type(e).__name__} - {str(e)}")
            logger.exception("Full traceback:")
            return {
                "metadata": {},
                "content": [],
                "images": {"count": 0, "items": []}
            } 