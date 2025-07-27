from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Optional

class YouTubeExtractor:
    async def get_transcript(self, url: str) -> Optional[str]:
        """Extract transcript from YouTube video"""
        try:
            # Extract video ID from URL
            video_id = self._extract_video_id(url)
            if not video_id:
                return None
            
            # Get transcript
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Combine transcript text
            text = " ".join([entry['text'] for entry in transcript])
            
            return text.strip()
            
        except Exception as e:
            print(f"Error extracting YouTube transcript: {e}")
            return None
    
    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
