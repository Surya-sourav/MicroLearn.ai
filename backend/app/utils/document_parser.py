import PyPDF2
import docx
from typing import Optional, List, Dict
from unstructured.partition.pdf import partition_pdf
from unstructured.partition.common import convert_to_dict
from unstructured.documents.elements import (
    Text, Title, NarrativeText, ListItem, Table
)
import magic
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DocumentParser:
    """Enhanced document parser using Unstructured-IO"""
    
    def extract_pdf_text(self, file_path: str) -> Dict[str, any]:
        """
        Extract text and metadata from PDF file using Unstructured-IO
        Returns a dictionary containing:
        - text: List of text elements with their types
        - metadata: Document metadata
        - tables: Extracted tables
        """
        try:
            # Verify file is PDF
            mime = magic.Magic(mime=True)
            file_type = mime.from_file(file_path)
            if not file_type.startswith('application/pdf'):
                raise ValueError(f"Invalid file type: {file_type}")

            # Extract content with Unstructured-IO
            elements = partition_pdf(
                filename=file_path,
                strategy="fast",
                include_metadata=True,
                include_page_breaks=True,
                extract_images_in_pdf=False  # Set to True if image extraction needed
            )

            # Convert elements to structured format
            structured_content = []
            tables = []
            metadata = {
                "title": Path(file_path).stem,
                "pages": 0,
                "sections": []
            }

            current_section = None
            
            for element in elements:
                element_dict = convert_to_dict(element)
                
                # Track document structure
                if isinstance(element, Title):
                    current_section = element.text
                    metadata["sections"].append(current_section)
                
                # Handle different element types
                if isinstance(element, (Text, NarrativeText)):
                    structured_content.append({
                        "type": "text",
                        "content": element.text,
                        "section": current_section,
                        "metadata": {
                            "page_number": element_dict.get("page_number", 1),
                            "category": element_dict.get("category", "body")
                        }
                    })
                elif isinstance(element, Table):
                    tables.append({
                        "type": "table",
                        "content": element.text,
                        "section": current_section,
                        "metadata": element_dict
                    })
                elif isinstance(element, ListItem):
                    structured_content.append({
                        "type": "list_item",
                        "content": element.text,
                        "section": current_section,
                        "metadata": element_dict
                    })

            # Update metadata
            metadata["pages"] = max(
                element_dict.get("page_number", 1) 
                for element_dict in [convert_to_dict(e) for e in elements]
            )

            return {
                "content": structured_content,
                "tables": tables,
                "metadata": metadata
            }

        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise

    def extract_docx_text(self, file_path: str) -> Optional[str]:
        """Extract text from DOCX file"""
        # TODO: Enhance DOCX parsing similar to PDF
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            return None