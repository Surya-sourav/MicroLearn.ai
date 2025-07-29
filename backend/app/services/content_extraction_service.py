# import os
# import logging
# from typing import List, Dict, Any, Optional
# import camelot
# import tabula
# import cv2
# import numpy as np
# import pandas as pd
# from PIL import Image
# from pathlib import Path
# import pytesseract
# import json

# logger = logging.getLogger(__name__)

# class ContentExtractionService:
#     def __init__(self):
#         pass
        
#     async def extract_tables(self, pdf_path: str) -> List[Dict[str, Any]]:
#         """
#         Extract tables from PDF using both Camelot and Tabula
#         Returns list of tables with their metadata and content
#         """
#         try:
#             tables = []
            
#             # Try Camelot first (better for complex tables)
#             camelot_tables = camelot.read_pdf(
#                 pdf_path,
#                 pages='all',
#                 flavor='lattice'  # Use 'stream' for text-based tables
#             )
            
#             for idx, table in enumerate(camelot_tables):
#                 df = table.df
#                 # Calculate table quality metrics
#                 accuracy = table.accuracy
#                 whitespace = table.whitespace
                
#                 tables.append({
#                     'extractor': 'camelot',
#                     'table_number': idx + 1,
#                     'page': table.page,
#                     'data': df.to_dict('records'),
#                     'headers': df.columns.tolist(),
#                     'quality_metrics': {
#                         'accuracy': accuracy,
#                         'whitespace': whitespace
#                     }
#                 })
            
#             # If Camelot didn't find tables, try Tabula
#             if not tables:
#                 tabula_tables = tabula.read_pdf(
#                     pdf_path,
#                     pages='all',
#                     multiple_tables=True
#                 )
                
#                 for idx, df in enumerate(tabula_tables):
#                     if not df.empty:
#                         tables.append({
#                             'extractor': 'tabula',
#                             'table_number': idx + 1,
#                             'data': df.to_dict('records'),
#                             'headers': df.columns.tolist()
#                         })
            
#             return tables
            
#         except Exception as e:
#             logger.error(f"Error extracting tables: {str(e)}")
#             return []
    
#     async def extract_images(self, pdf_path: str, output_dir: str) -> List[Dict[str, Any]]:
#         """
#         Extract and analyze images from PDF
#         Returns list of images with their metadata and OCR text
#         """
#         try:
#             images = []
#             output_path = Path(output_dir)
#             output_path.mkdir(exist_ok=True)
            
#             # Convert PDF pages to images
#             from pdf2image import convert_from_path
#             pages = convert_from_path(pdf_path)
            
#             for page_num, page in enumerate(pages, start=1):
#                 # Save page as image
#                 page_path = output_path / f"page_{page_num}.png"
#                 page.save(str(page_path))
                
#                 # Extract images from page using OpenCV
#                 cv_image = cv2.imread(str(page_path))
#                 gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
#                 _, thresh = cv2.threshold(gray, 250, 255, cv2.THRESH_BINARY_INV)
#                 contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
#                 for idx, contour in enumerate(contours):
#                     if cv2.contourArea(contour) > 1000:  # Filter small contours
#                         x, y, w, h = cv2.boundingRect(contour)
#                         image_region = cv_image[y:y+h, x:x+w]
                        
#                         # Save extracted image
#                         image_path = output_path / f"page_{page_num}_image_{idx}.png"
#                         cv2.imwrite(str(image_path), image_region)
                        
#                         # Open with PIL for analysis
#                         pil_image = Image.open(image_path)
                        
#                         # Extract text from image using OCR
#                         ocr_text = pytesseract.image_to_string(pil_image)
                        
#                         images.append({
#                             'page_number': page_num,
#                             'image_path': str(image_path),
#                             'position': {'x': x, 'y': y, 'width': w, 'height': h},
#                             'ocr_text': ocr_text.strip(),
#                             'size': {
#                                 'width': pil_image.width,
#                                 'height': pil_image.height,
#                                 'aspect_ratio': pil_image.width / pil_image.height
#                             }
#                         })
            
#             return images
            
#         except Exception as e:
#             logger.error(f"Error extracting images: {str(e)}")
#             return []
    
#     async def analyze_document_structure(self, pdf_path: str) -> Dict[str, Any]:
#         """
#         Analyze document structure including tables, images, and text layout
#         """
#         try:
#             # Extract tables and images
#             tables = await self.extract_tables(pdf_path)
#             images = await self.extract_images(pdf_path, os.path.join(os.path.dirname(pdf_path), 'images'))
            
#             # Analyze document structure
#             structure = {
#                 'tables': {
#                     'count': len(tables),
#                     'locations': [{'page': table['page']} for table in tables if 'page' in table],
#                     'content': tables
#                 },
#                 'images': {
#                     'count': len(images),
#                     'locations': [img['position'] for img in images],
#                     'content': images
#                 },
#                 'metadata': {
#                     'has_tables': len(tables) > 0,
#                     'has_images': len(images) > 0,
#                     'table_pages': list(set(table['page'] for table in tables if 'page' in table)),
#                     'image_pages': list(set(img['page_number'] for img in images))
#                 }
#             }
            
#             return structure
            
#         except Exception as e:
#             logger.error(f"Error analyzing document structure: {str(e)}")
#             return {
#                 'tables': {'count': 0, 'locations': [], 'content': []},
#                 'images': {'count': 0, 'locations': [], 'content': []},
#                 'metadata': {'has_tables': False, 'has_images': False}
#             } 