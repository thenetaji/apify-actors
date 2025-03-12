# TikTok Post Scraper

## 🚀 Overview

**This tool can also extract profiles**

TikTok Post Scraper is a powerful, dedicated tool that extracts comprehensive data from TikTok videos and posts. Built as an [Apify](https://apify.com) actor, this specialized scraper enables content creators, marketers, researchers, and social media analysts to gather detailed insights from TikTok content with precision and reliability.

Whether you're analyzing viral trends, tracking competitor performance, or researching content strategy, this scraper delivers the granular post data you need to gain a competitive edge in the TikTok ecosystem.

## ✨ Features

- **Complete Post Analytics**: Extract comprehensive engagement metrics including likes, shares, comments, and play counts
- **Video Content Details**: Access video URLs, cover images, quality settings, and format information
- **Creator Insights**: Gather author information associated with each post
- **Music Tracking**: Extract music data used in TikTok videos for trend analysis
- **Flexible URL Processing**: Works with individual post URLs or can process multiple videos simultaneously
- **Proxy Support**: Built-in proxy configuration for consistent and reliable data collection
- **Clean, Structured Output**: All data returned in a well-organized JSON format for easy analysis

## 📊 Data Output

### Post Output Structure

```json
{
  "videoId": "post12345",
  "description": "Post caption text",
  "createTime": "2022-01-01T00:00:00.000Z",
  "videoUrl": "https://example.com/video.mp4",
  "coverImage": "https://example.com/cover.jpg",
  "bitrate": 1500000,
  "quality": "hd",
  "format": "mp4",
  "authorId": "user12345",
  "authorUsername": "username",
  "authorNickname": "User Display Name",
  "authorVerified": true,
  "musicId": "music12345",
  "musicTitle": "Music track title",
  "musicUrl": "https://example.com/music.mp3",
  "likes": 5000,
  "shares": 1000,
  "comments": 500,
  "plays": 50000
}
```

## 🔧 Usage

### Input Parameters

The actor accepts the following input parameters:

```json
{
  "urls": [
    { "url": "https://www.tiktok.com/@username/video/1234567890123456789" },
    { "url": "https://www.tiktok.com/@username/video/9876543210987654321" }
  ],
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"
  },
  "test": false
}
```

- **urls**: Array of TikTok post URLs to scrape
- **proxy**: Configuration for proxy usage
  - **useApifyProxy**: Whether to use Apify's proxy service
  - **apifyProxyGroups**: Proxy groups to use (RESIDENTIAL recommended for best results)
  - **apifyProxyCountry**: Country to use for proxy servers (affects content availability)
- **test**: Run in test mode (without proxies)

### Running the Scraper

1. Create an account on [Apify](https://apify.com) if you don't have one
2. Deploy this actor to your Apify account
3. Configure the input parameters with your target TikTok post URLs
4. Run the actor and collect your detailed post data

## 💡 Use Cases

- **Content Performance Analysis**: Measure engagement metrics across different types of content
- **Trend Research**: Identify viral videos and analyze what makes them successful
- **Competitor Content Tracking**: Monitor and analyze competitors' most successful posts
- **Hashtag Analysis**: Track performance of posts using specific hashtags
- **Influencer Selection**: Evaluate potential partners based on post engagement metrics
- **Content Strategy Development**: Research successful content formats and topics
- **Music Trend Analysis**: Discover popular sounds and music tracks used in viral content

## ⚙️ Technical Details

This TikTok Post Scraper is built as an Apify actor using Node.js. It employs sophisticated techniques to extract valuable data from TikTok posts while respecting the platform's structure and limitations.

The scraper automatically processes TikTok post URLs and extracts a comprehensive set of data points including video details, engagement metrics, author information, and music data.

### Advanced Features

- **Automatic URL Detection**: Intelligently identifies and processes TikTok post URLs
- **Detailed Video Information**: Extracts technical details about video quality and format
- **Comprehensive Engagement Data**: Captures the full range of interaction metrics
- **Creator Details**: Associates content with creator information for contextual analysis
- **Media Access**: Provides direct links to video and cover image resources

## 🔒 Limitations

- The scraper respects TikTok's robots.txt rules and rate limits
- Posts from private accounts cannot be scraped
- Content availability depends on TikTok's regional restrictions
- Performance may vary based on TikTok's platform changes and updates
- Some extremely viral posts may have approximated engagement counts

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⭐ Support & Contributions

If you find this tool useful, please consider:
- Starring the repository on GitHub
- Contributing to its development
- Reporting any issues or suggesting enhancements
- Sharing your successful use cases

## 🔍 Complementary Tools

This TikTok Post Scraper can be used alongside our TikTok Profile Scraper for complete TikTok data collection capabilities. Combine both tools for comprehensive TikTok analytics.

---