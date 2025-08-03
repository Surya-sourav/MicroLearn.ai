#!/usr/bin/env python3
"""
Test script for YouTube transcript extraction
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append('/app')

from app.utils.youtube_extractor import YouTubeExtractor
from app.utils.web_scraper import WebScraper

async def test_youtube_extraction():
    """Test YouTube transcript extraction"""
    print("🧪 Testing YouTube Transcript Extraction...")
    
    # Test URLs
    test_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Roll (should have transcript)
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",  # Me at the zoo (first YouTube video)
    ]
    
    extractor = YouTubeExtractor()
    
    for url in test_urls:
        print(f"\n🔍 Testing URL: {url}")
        try:
            transcript = await extractor.get_transcript(url)
            if transcript:
                print(f"✅ Success! Transcript length: {len(transcript)} characters")
                print(f"📝 Preview: {transcript[:200]}...")
            else:
                print("❌ Failed to extract transcript")
        except Exception as e:
            print(f"❌ Error: {e}")

async def test_web_scraping():
    """Test web content scraping"""
    print("\n🧪 Testing Web Content Scraping...")
    
    # Test URLs
    test_urls = [
        "https://example.com",
        "https://httpbin.org/html",
    ]
    
    scraper = WebScraper()
    
    for url in test_urls:
        print(f"\n🔍 Testing URL: {url}")
        try:
            content = await scraper.extract_content(url)
            if content:
                print(f"✅ Success! Content length: {len(content)} characters")
                print(f"📝 Preview: {content[:200]}...")
            else:
                print("❌ Failed to extract content")
        except Exception as e:
            print(f"❌ Error: {e}")

async def main():
    """Main test function"""
    print("🚀 Starting YouTube and Web Extraction Tests...")
    
    await test_youtube_extraction()
    await test_web_scraping()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 