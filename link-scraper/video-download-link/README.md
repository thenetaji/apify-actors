# 🎥 Video Download Link Crawler

[![Apify Actor](https://img.shields.io/badge/Powered%20by-Apify-blue.svg)](https://apify.com)

🚀 Easily crawl websites to detect and extract video download links, along with other media types like images, audio files, and APKs. Perfect for content creators, researchers, and developers who need to gather media assets from websites.

## 🎯 What Does It Do?

This powerful crawler specializes in finding video download links while also supporting:
- 🎬 Videos (MP4, WebM, etc.)
- 🖼️ Images (JPG, PNG, GIF, etc.)
- 🎵 Audio files (MP3, WAV, etc.)
- 📱 APK files (Android applications)

## ⚙️ Input Configuration

Configure your crawl with these parameters:

- 🔗 **startUrls**: List of URLs to begin crawling
- 📋 **mediaType**: Choose what to extract:
  - `video` (focus on videos)
  - `all` (get everything)
  - `image` (images only)
  - `audio` (audio files)
  - `apk` (Android packages)
- 🌲 **maxCrawlDepth**: How deep to crawl (default: 1)
- 🚦 **maxConcurrency**: Parallel requests (default: 10)
- 🔄 **maxRequestRetries**: Retry attempts (default: 3)
- 🎯 **maxUrlsToCrawl**: URL limit (default: 100)
- 🔒 **useProxy**: Proxy settings for better success rates

### 📝 Example Input

```json
{
  "startUrls": [
    { "url": "https://example.com" }
  ],
  "mediaType": "video",
  "maxCrawlDepth": 2,
  "maxConcurrency": 5,
  "maxRequestRetries": 2,
  "maxUrlsToCrawl": 50,
  "useProxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"
  }
}
```

## 📊 Output Data

Get structured data for each media link:

```json
{
  "sourceUrl": "https://example.com",
  "pageTitle": "Example Page",
  "mediaLinks": [
    {
      "url": "https://example.com/media/video.mp4",
      "sourceUrl": "https://example.com",
      "title": "Example Page",
      "type": "video",
      "foundAt": "2025-03-13T02:16:08Z"
    }
  ],
  "timestamp": "2025-03-13T02:16:08Z"
}
```

## ✨ Key Features

- 🤖 **Smart Detection**: Automatically identifies various media types
- 🔄 **Flexible Crawling**: Adjust depth and concurrency
- 🛡️ **Proxy Support**: Uses Apify's proxy infrastructure
- 📊 **Detailed Output**: Get organized, structured data
- 🚀 **High Performance**: Optimized for speed and reliability

## 🚀 Getting Started

1. Visit [Apify](https://apify.com)
2. Search for "Video Download Link Crawler"
3. Set your parameters
4. Start crawling!

## 💡 Pro Tips

- Use `maxCrawlDepth` wisely to control the scope
- Enable proxies for better success rates
- Start with a small `maxUrlsToCrawl` to test
- Use `mediaType: "all"` to get every media type

## 🆘 Need Help?

Contact @thenetaji for support or visit [Apify Documentation](https://docs.apify.com)

## 🚀 Explore Our Analytics Ecosystem

### 📱 [TikTok Profile Scraper](https://apify.com/thenetaji/tiktok-profile-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Advanced tool for extracting detailed TikTok user profiles and engagement metrics.

### 🎵 [TikTok Video Downloader (No Watermarks)](https://apify.com/thenetaji/tiktok-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Download clean TikTok videos without platform watermarks for content repurposing.

### 🎥 [YouTube Video Downloader](https://apify.com/thenetaji/youtube-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Efficiently extract YouTube video content in multiple resolution options.

### 🔊 [YouTube Music Downloader](https://apify.com/thenetaji/youtube-music-downloader/api/openapi?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Extract audio tracks from YouTube videos for offline use and analysis.

### 📊 [YouTube Scraper](https://apify.com/thenetaji/youtube-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Comprehensive YouTube data extraction for channel and video analytics.

### 🌐 [Website Media Link Scraper](https://apify.com/thenetaji/website-media-link-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Extract media assets from websites for content analysis and archiving.

### 📹 [YouTube Video & Music Downloader](https://apify.com/thenetaji/youtube-video-and-music-downloader?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)

Combined solution for extracting both video and audio content from YouTube.

## 📘 Documentation & Support

For implementation questions, feature requests, or technical assistance, contact our development team through the Apify platform.
