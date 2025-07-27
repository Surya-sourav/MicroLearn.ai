import httpx
from bs4 import BeautifulSoup
from typing import Optional

class WebScraper:
    async def scrape_url(self, url: str) -> Optional[str]:
        """Scrape content from web URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                
                # Clean up text
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                return text
                
        except Exception as e:
            print(f"Error scraping URL {url}: {e}")
            return None