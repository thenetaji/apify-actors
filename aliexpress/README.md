# 🔍 Media Link Crawler

[![Apify Actor](https://img.shields.io/badge/Powered%20by-Apify-blue.svg)](https://apify.com)

🚀 Effortlessly crawl websites to detect and extract media links such as videos, images, audio files, and APKs. Perfect for gathering media assets from various webpages with customizable parameters.

## 🎯 What is Media Link Crawler?

Media Link Crawler is an Apify actor designed to scrape and extract media links from websites. It supports:
- 🎬 Videos (MP4, WebM, etc.)
- 🖼️ Images (JPG, PNG, GIF, etc.)
- 🎵 Audio files (MP3, WAV, etc.)
- 📱 APK files (Android applications)

Configure the actor to crawl specific depths, handle multiple URLs concurrently, and use proxies for enhanced scraping capabilities.

## ⚙️ How to Use

### Input Configuration

To use the Media Link Crawler, you need to provide the following input parameters:

- 🔗 **startUrls**: List of initial URLs to start crawling from
- 📋 **mediaType**: Type of media to extract (`all`, `video`, `audio`, `image`, `apk`)
- 🌲 **maxCrawlDepth**: Maximum depth of the crawl (default: 1)
- 🚦 **maxConcurrency**: Concurrent requests (default: 10)
- 🔄 **maxRequestRetries**: Retry attempts (default: 3)
- 🎯 **maxUrlsToCrawl**: URL limit (default: 100)
- 🔒 **useProxy**: Proxy configuration
  - Enable Apify Proxy (default: false)
  - Specify proxy groups (e.g., `RESIDENTIAL`)
  - Select country code

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
      "foundAt": "2025-03-13T02:17:41Z"
    }
  ],
  "timestamp": "2025-03-13T02:17:41Z"
}
```

## ✨ Benefits

- 🤖 **Automated Scraping**: Extract media links from multiple URLs automatically
- 🎯 **Customizable**: Configure depth, concurrency, and media types
- 🛡️ **Proxy Support**: Enhanced scraping with Apify Proxy
- 📊 **Detailed Logging**: Monitor the scraping process

## 🚀 Explore Our Analytics Ecosystem

### 📱 [TikTok Profile Scraper](https://apify.com/thenetaji/tiktok-profile-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Advanced TikTok profile and metrics extraction

### 🎵 [TikTok Video Downloader](https://apify.com/thenetaji/tiktok-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Download TikTok videos without watermarks

### 🎥 [YouTube Video Downloader](https://apify.com/thenetaji/youtube-video-downloader/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract YouTube videos in multiple resolutions

### 🔊 [YouTube Music Downloader](https://apify.com/thenetaji/youtube-music-downloader/api/openapi?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract audio from YouTube videos

### 📊 [YouTube Scraper](https://apify.com/thenetaji/youtube-scraper?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Comprehensive YouTube data extraction

### 🌐 [Website Media Link Scraper](https://apify.com/thenetaji/website-media-link-scraper/api?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
Extract media assets from websites

### 📹 [YouTube Video & Music Downloader](https://apify.com/thenetaji/youtube-video-and-music-downloader?utm_source=actor-docs&utm_medium=readme&utm_campaign=thenetaji)
All-in-one YouTube content extractor

## 📮 Support & Documentation

Need help? Contact @thenetaji through the Apify platform for:
- Implementation questions
- Feature requests
- Technical support

Happy Scraping! 🎉