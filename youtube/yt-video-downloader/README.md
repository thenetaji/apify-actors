# YouTube Video Downloader Actor 📹🎬

A powerful Apify actor designed to download high-quality videos from YouTube with customizable resolution and format options. Perfect for content creators, educators, researchers, and anyone needing offline access to YouTube videos.

## 🌟 Key Features

- Download videos in multiple resolutions (144p to 4320p/8K)
- Support for various video formats (MP4, WebM, MKV)
- Optimized concurrent downloading for faster processing
- Residential proxy integration for reliable access
- Batch processing for multiple URLs
- Works with regular YouTube videos and shorts

## 📋 Input Settings Made Simple

### 1. YouTube URLs
- Paste one or more YouTube video or shorts URLs
- Works with any YouTube video format
- Example: `https://youtube.com/shorts/8wst-04IuWI`

### 2. Video Quality
Choose your preferred resolution:
- **144p** - Lowest quality, smallest file size
- **240p** - Low quality
- **360p** - Default quality, good balance
- **480p** - Standard definition
- **720p** - HD quality
- **1080p** - Full HD quality
- **1440p** - 2K quality
- **2160p** - 4K Ultra HD quality
- **4320p** - 8K quality (if available)
- **best** - Automatically selects highest available quality

### 3. Video Format
Select your preferred video container format:
- **default** - Automatically selects optimal format (recommended)
- **mp4** - Most compatible format for all devices
- **webm** - Modern format with excellent compression
- **mkv** - High flexibility format that supports many codecs

### 4. Performance Settings
- **Concurrency**: Control download speed (1-20)
  - Default: 5 concurrent downloads
  - Higher values = faster downloads but more bandwidth
  - Recommended range: 5-10 to avoid rate limiting

### 5. Proxy Settings
- Uses Apify's RESIDENTIAL proxy by default
- Required for reliable downloads and avoiding rate limits

## 📤 Output

Each successfully downloaded video provides:
```json
{
    "title": "Video_Title",
    "downloadURL": "https://api.apify.com/v2/key-value-stores/..."
}
```

The output includes:
- Original title from the YouTube video
- Direct download link to the video file

## 🚀 Usage Examples

### Download HD Video
```json
{
    "urls": [{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}],
    "quality": "720",
    "format": "mp4",
    "concurrency": 5,
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
    }
}
```

### Download High-Resolution Video
```json
{
    "urls": [{"url": "https://www.youtube.com/watch?v=exampleVideo"}],
    "quality": "1080",
    "format": "mkv",
    "concurrency": 8,
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
    }
}
```

## ⚠️ Important Notes

1. Higher resolutions require more processing time and storage space
2. The actor requires Apify's RESIDENTIAL proxy for production use
3. Some video formats may take longer to process due to conversion requirements
4. Always ensure you have proper rights to download and use the content
5. Available quality is limited by the original video quality

## 🔍 Error Handling

The actor handles various error scenarios:
- Invalid URLs
- Proxy configuration issues
- Download processing errors
- Format conversion problems

Each error returns informative messages to help troubleshoot quickly.

## 🚀 Try Our Other Actors

### 🎵 [YouTube Music Downloader](https://apify.com/thenetaji/youtube-music-downloader/api/openapi?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Quickly download high-quality audio tracks from YouTube with proxy support.

### 📹 [YouTube Video & Music Downloader](https://apify.com/thenetaji/youtube-video-and-music-downloader?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
All-in-one solution to download both video and audio from YouTube with flexible quality settings.

### 🎵 [TikTok Video Downloader (No Watermarks)](https://apify.com/thenetaji/tiktok-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Download TikTok videos in high quality without watermarks. No account required!

### 📷 [TikTok Profile Scraper](https://apify.com/thenetaji/tiktok-profile-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Scrape TikTok profiles, including usernames, followers, bios, videos, captions, and more.

### 🌐 [Website Media Link Scraper](https://apify.com/thenetaji/website-media-link-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract video, audio, and image links from websites efficiently using lightweight HTTP requests.

### 🔍 [YouTube Scraper](https://apify.com/thenetaji/youtube-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract video details, channel stats, likes, and view counts from YouTube without API quotas.

### 📊 [TikTok Scraper](https://apify.com/thenetaji/tiktok-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract detailed TikTok profile and post data, including comments, likes, and follower counts.

## 🆘 Support

For issues, feature requests, or questions, please create an issue in the repository or contact the author through Apify's platform.