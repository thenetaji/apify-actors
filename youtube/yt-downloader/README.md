# YouTube Video & Music Downloader Actor 🎵🎥

A powerful and versatile Apify actor that allows you to download both videos and audio from YouTube with customizable quality settings and format options. Perfect for content creators, researchers, and anyone needing offline access to YouTube content.

## 🌟 Key Features

- Download videos in multiple quality settings (144p to 4320p)
- Extract audio-only content with various bitrate options (64kbps to 320kbps)
- Support for multiple video and audio formats
- Residential proxy integration for reliable access
- Batch processing of multiple URLs
- Automatic file storage and management

## 📋 Input Settings Made Simple

### 1. Video URLs
- Paste one or more YouTube video URLs
- Supports both regular videos and YouTube Shorts
- Example: `https://youtube.com/shorts/CuC00GUDJsU`

### 2. Download Mode
- **Audio Only Mode**: Toggle ON to extract just the audio
  - Perfect for downloading music or podcast content
  - OFF by default (downloads full video)

### 3. Quality Settings
#### For Videos (when Audio Only is OFF):
- Choose from multiple resolutions:
  - 144p, 240p, 360p (default)
  - 480p, 720p (HD)
  - 1080p (Full HD)
  - 1440p, 2160p (4K), 4320p (8K)
  - "best" or "worst" options available

#### For Audio (when Audio Only is ON):
- Select your preferred audio quality:
  - 320kbp/s (High Quality)
  - 256kbp/s (Good Quality)
  - 128kbp/s (Standard Quality)
  - 64kbp/s (Basic Quality)
  - "best" or "worst" options available

### 4. Format Options
#### Video Formats:
- default (recommended)
- mp4
- webm
- mkv

#### Audio Formats:
- default (recommended)
- mp3
- aac
- m4a
- flac
- opus
- wav
- vorbis
- alac

### 5. Performance Settings
- **Concurrency**: Control download speed (1-20)
  - Default: 5 concurrent downloads
  - Higher values = faster downloads but more bandwidth
  - Recommended range: 5-10 to avoid rate limiting

### 6. Proxy Settings
- Uses Apify's RESIDENTIAL proxy by default
- Required for reliable downloads

## 📤 Output

Each successful download provides:
```json
{
    "title": "Video_Title",
    "downloadURL": "https://api.apify.com/v2/key-value-stores/..."
}
```

## 🚀 Try Our Other Actors

### 🎵 [TikTok Video Downloader (No Watermarks)](https://apify.com/thenetaji/tiktok-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Download TikTok videos in high quality without watermarks. No account required!

### 📷 [TikTok Profile Scraper](https://apify.com/thenetaji/tiktok-profile-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Scrape TikTok profiles, including usernames, followers, bios, videos, captions, and more.

### 🌐 [Website Media Link Scraper](https://apify.com/thenetaji/website-media-link-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract video, audio, and image links from websites efficiently using lightweight HTTP requests.

### 📹 [YouTube Video Downloader](https://apify.com/thenetaji/youtube-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Download high-quality YouTube videos with batch support for fast media collection.

### 🔍 [YouTube Scraper](https://apify.com/thenetaji/youtube-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract video details, channel stats, likes, and view counts from YouTube without API quotas.

### 🎶 [YouTube Music Downloader](https://apify.com/thenetaji/youtube-music-downloader/api/openapi?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Quickly download high-quality audio tracks from YouTube with proxy support.

### 📊 [TikTok Scraper](https://apify.com/thenetaji/tiktok-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract detailed TikTok profile and post data, including comments, likes, and follower counts.

## ⚠️ Important Notes

1. The actor requires Apify's RESIDENTIAL proxy for production use
2. All downloads are processed in compliance with YouTube's terms of service
3. Ensure you have proper rights to download and use the content
4. Processing time varies based on file size and quality settings

## 🔍 Error Handling

The actor implements robust error handling for various scenarios:
- Input validation errors
- Proxy configuration issues
- Download processing errors
- File storage errors

Each error provides detailed information to help troubleshoot issues quickly.

## 🆘 Support

For issues, feature requests, or questions, please create an issue in the repository or contact the author through Apify's platform.