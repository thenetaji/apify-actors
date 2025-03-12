# TikTok Profile Scraper

## 🚀 Overview

**You can also scrape posts from it**

TikTok Profile Scraper is a powerful, lightweight tool that extracts detailed profile information from TikTok accounts. Built as an [Apify](https://apify.com) actor, this tool enables businesses, marketers, and researchers to gather valuable insights from TikTok profiles and posts with ease.

Whether you're conducting influencer research, competitor analysis, or content performance tracking, this scraper provides the comprehensive data you need to make informed decisions.

## ✨ Features

- **Profile Data Extraction**: Collect detailed information from TikTok user profiles including follower count, following count, bio information, and more
- **Post Analytics**: Extract engagement metrics from posts including likes, shares, comments and play counts
- **Dual Functionality**: Scrape both profiles and individual posts with a single tool
- **Proxy Support**: Built-in proxy configuration for reliable data collection
- **Clean, Structured Output**: All data is returned in a well-organized JSON format

## 📊 Data Output

### Profile Output Structure

```json
{
  "userId": "user12345",
  "uniqueId": "username",
  "nickname": "User Display Name",
  "title": "Profile Title",
  "description": "Profile Description",
  "avatarLarge": "https://example.com/avatar_large.jpg",
  "avatarMedium": "https://example.com/avatar_medium.jpg",
  "avatarThumb": "https://example.com/avatar_thumb.jpg",
  "bioSignature": "User bio text",
  "bioLink": "https://userwebsite.com",
  "createdAt": "2020-01-01T00:00:00.000Z",
  "verified": true,
  "region": "US",
  "privateAccount": false,
  "followers": 100000,
  "following": 1000,
  "likes": 500000,
  "videos": 120
}
```

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
    { "url": "https://www.tiktok.com/@username" },
    { "url": "https://www.tiktok.com/@username/video/1234567890123456789" }
  ],
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"
  },
  "test": false
}
```

- **urls**: Array of TikTok profile or post URLs to scrape
- **proxy**: Configuration for proxy usage
  - **useApifyProxy**: Whether to use Apify's proxy service
  - **apifyProxyGroups**: Proxy groups to use (RESIDENTIAL recommended)
  - **apifyProxyCountry**: Country to use for proxy servers
- **test**: Run in test mode (without proxies)

### Running the Scraper

1. Create an account on [Apify](https://apify.com) if you don't have one
2. Deploy this actor to your Apify account
3. Configure the input parameters with your target TikTok URLs
4. Run the actor and collect your data

## 💡 Use Cases

- **Influencer Marketing**: Identify potential influencer partners and analyze their audience engagement
- **Competitor Analysis**: Track competitor content strategy and performance metrics
- **Content Research**: Discover trending topics and popular content formats
- **Performance Tracking**: Monitor your own TikTok account's growth and engagement
- **Market Research**: Gather insights about audience preferences and behaviors

## ⚙️ Technical Details

This TikTok scraper is built as an Apify actor using Node.js. It utilizes advanced techniques to navigate TikTok's platform and extract valuable data while respecting the platform's limitations.

The actor automatically detects whether a URL points to a profile or a post and processes it accordingly, making it versatile for various scraping needs.

## 🔒 Limitations

- The scraper respects TikTok's robots.txt rules and rate limits
- Private accounts cannot be fully scraped
- Content availability depends on TikTok's regional restrictions
- Performance may vary based on TikTok's platform changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⭐ Support & Contributions

If you find this tool useful, please consider:
- Starring the repository on GitHub
- Contributing to its development
- Reporting any issues or suggestions

---