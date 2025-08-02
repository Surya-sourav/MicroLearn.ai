#!/usr/bin/env python3
"""
Test script for specific YouTube URL that was failing
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append('/app')

from app.utils.youtube_extractor import YouTubeExtractor

async def test_specific_youtube():
    """Test the specific YouTube URL that was failing"""
    print("🧪 Testing Specific YouTube URL...")
    
    # The URL that was failing
    failing_url = "https://youtu.be/-pqzyvRp3Tc?si=Gw3xtJ7dV1AKL9JB"
    
    extractor = YouTubeExtractor()
    
    print(f"🔍 Testing URL: {failing_url}")
    try:
        transcript = await extractor.get_transcript(failing_url)
        if transcript:
            print(f"✅ Success! Transcript length: {len(transcript)} characters")
            print(f"📝 Preview: {transcript[:200]}...")
        else:
            print("❌ Failed to extract transcript")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Main test function"""
    print("🚀 Starting Specific YouTube Test...")
    
    await test_specific_youtube()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 