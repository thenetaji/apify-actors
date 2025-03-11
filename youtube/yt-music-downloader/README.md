# YouTube Music Downloader Actor 🎵🎧

A specialized Apify actor designed to extract high-quality audio from YouTube videos and shorts. Perfect for music enthusiasts, podcast creators, and anyone looking to build an offline music collection from YouTube content.

## 🌟 Key Features

- Extract audio from any YouTube video or short
- Multiple audio quality options (64kbps to 320kbps)
- Support for various audio formats (MP3, AAC, FLAC, etc.)
- Residential proxy integration for reliable access
- Batch processing for multiple URLs
- Automatic file storage with direct download links

## 📋 Input Settings Made Simple

### 1. YouTube URLs
- Paste one or more YouTube video or shorts URLs
- Works with regular videos, music videos, and shorts
- Example: `https://youtube.com/shorts/8wst-04IuWI`

### 2. Audio Quality
Choose your preferred audio quality:
- **Best** (default) - Automatically selects highest available quality
- **320kbp/s** - Studio quality audio
- **256kbp/s** - High quality audio
- **128kbp/s** - Standard quality audio
- **64kbp/s** - Low quality audio (smallest file size)

### 3. Audio Format
Select your preferred file format:
- **default** - Automatically selects optimal format (recommended)
- **mp3** - Most compatible format for all devices
- **aac** - High efficiency format, good for Apple devices
- **m4a** - Good quality and compatibility
- **flac** - Lossless audio (larger file size)
- **opus** - Modern format with excellent compression
- **wav** - Uncompressed audio (largest file size)
- **vorbis** - Free and open-source format
- **alac** - Apple Lossless Audio Codec

### 4. Proxy Settings
- Uses Apify's RESIDENTIAL proxy by default
- Required for reliable downloads and avoiding rate limits

## 📤 Output

Each successfully processed audio file provides:
```json
{
    "title": "Audio_Track_Title",
    "downloadURL": "https://api.apify.com/v2/key-value-stores/..."
}
```

The output includes:
- Original title from the YouTube video
- Direct download link to the extracted audio file

## 🚀 Usage Examples

### Download High-Quality Music Track
```json
{
    "urls": [{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}],
    "quality": "320",
    "format": "mp3",
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
    }
}
```

### Download Podcast Audio
```json
{
    "urls": [{"url": "https://www.youtube.com/watch?v=examplePodcast"}],
    "quality": "128",
    "format": "m4a",
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
    }
}
```

## ⚠️ Important Notes

1. This actor is designed specifically for audio extraction
2. The actor requires Apify's RESIDENTIAL proxy for production use
3. Some audio formats may take longer to process due to conversion requirements
4. Always ensure you have proper rights to download and use the content
5. Audio quality is limited by the original source quality

## 🔍 Error Handling

The actor handles various error scenarios:
- Invalid URLs
- Proxy configuration issues
- Download processing errors
- Format conversion problems

Each error returns informative messages to help troubleshoot quickly.

## 🚀 Try Our Other Actors

### 📹 [YouTube Video & Music Downloader](https://apify.com/thenetaji/youtube-video-and-music-downloader?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
All-in-one solution to download both video and audio from YouTube with flexible quality settings.

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

### 📊 [TikTok Scraper](https://apify.com/thenetaji/tiktok-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract detailed TikTok profile and post data, including comments, likes, and follower counts.

## 🆘 Support

For issues, feature requests, or questions, please create an issue in the repository or contact the author through Apify's platform.