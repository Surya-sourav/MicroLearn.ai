import PyPDF2
from typing import Dict, Optional
import docx
import logging

logger = logging.getLogger(__name__)

class DocumentParser:
    """Simple document parser using PyPDF2"""
    
    def extract_pdf_text(self, file_path: str) -> Dict[str, any]:
        try:
            with open(file_path, 'rb') as file:
                # Create PDF reader object
                reader = PyPDF2.PdfReader(file)
                
                # Extract text from each page
                content = []
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    content.append({
                        "type": "text",
                        "content": page.extract_text(),
                        "metadata": {
                            "page_number": page_num + 1
                        }
                    })

                metadata = {
                    "title": file_path.split("/")[-1],
                    "pages": len(reader.pages),
                }

                return {
                    "content": content,
                    "metadata": metadata,
                    "tables": []  
                }

        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise

    def extract_docx_text(self, file_path: str) -> Optional[str]:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            return None