from youtube_transcript_api import YouTubeTranscriptApi
import re
import logging
import asyncio
from typing import Optional
from functools import partial

logger = logging.getLogger(__name__)

class YouTubeExtractor:
    def _fetch_transcript_sync(self, video_id: str, languages=None):
        """Synchronous wrapper for fetching transcript"""
        try:
            api = YouTubeTranscriptApi()
            if languages:
                return api.fetch(video_id, languages)
            else:
                return api.fetch(video_id)
        except Exception as e:
            logger.error(f"Sync transcript fetch failed: {e}")
            raise
    
    async def get_transcript(self, url: str) -> Optional[str]:
        """Extract transcript from YouTube video"""
        try:
            # Extract video ID from URL
            video_id = self._extract_video_id(url)
            if not video_id:
                logger.error(f"Could not extract video ID from URL: {url}")
                return None
            
            logger.info(f"Extracting transcript for video ID: {video_id}")
            
            # Get transcript using the correct API method - run in thread pool to avoid blocking
            try:
                # Use the sync wrapper in thread pool
                loop = asyncio.get_event_loop()
                transcript_data = await loop.run_in_executor(
                    None, 
                    self._fetch_transcript_sync, 
                    video_id, 
                    ['en']
                )
            except Exception as transcript_error:
                logger.warning(f"Could not get English transcript, trying any language: {transcript_error}")
                try:
                    # Try without language restriction
                    loop = asyncio.get_event_loop()
                    transcript_data = await loop.run_in_executor(
                        None, 
                        self._fetch_transcript_sync, 
                        video_id
                    )
                except Exception as fallback_error:
                    logger.error(f"Failed to get transcript: {fallback_error}")
                    return None
            
            # Combine transcript text - transcript_data is a FetchedTranscript object
            text = " ".join([entry.text for entry in transcript_data])
            
            logger.info(f"Successfully extracted transcript with {len(transcript_data)} entries")
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting YouTube transcript: {e}")
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
