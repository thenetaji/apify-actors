# Website Media Link Scraper

Extract media content from any website fast. Find videos, images, and audio files hiding in web pages with a lightweight, efficient crawler that won't hog your resources.

## What it does

This actor scans websites to extract media links embedded within pages. Unlike browser-based scrapers, it uses lightweight HTTP requests to quickly discover and catalog media content across entire domains.

**Perfect for:**
- Content creators looking for media resources
- Researchers collecting media samples
- SEO specialists analyzing media usage
- Web developers auditing media assets

## How it works

1. **Enter a starting URL** - Point the scraper to your target website
2. **Choose scanning options** - Set crawl depth, link patterns, and media types
3. **Let it run** - The scraper finds all embedded media links
4. **Export the results** - Get a clean dataset of all discovered media

The actor intelligently follows links while identifying videos, images, audio files, and other media content embedded in HTML and JavaScript.

## Features

- 🚀 **High Performance**: Uses CheerioCrawler for minimal resource consumption
- 🕸️ **Deep Crawling**: Follows links across domains with configurable depth
- 🔍 **Smart Detection**: Finds media links hidden in HTML attributes and JavaScript
- 📋 **Comprehensive Output**: Organizes results by source URL and media type
- 💾 **Multiple Export Options**: CSV, JSON, Excel, and more

## Input Configuration

| Field | Type | Description |
|-------|------|-------------|
| `startUrls` | Array | Initial URLs to begin crawling |
| `maxDepth` | Number | How many links deep to crawl (default: 2) |
| `maxPagesPerCrawl` | Number | Limit on total pages to process |
| `mediaTypes` | Array | Types to extract (video, image, audio) |
| `followExternalLinks` | Boolean | Whether to crawl beyond the initial domain |

## Output Format

```json
{
  "sourceUrl": "https://example.com/page",
  "pageTitle": "Example Page",
  "mediaLinks": [
    {
      "type": "video",
      "url": "https://example.com/video.mp4",
      "format": "mp4"
    },
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "format": "jpg"
    }
  ],
  "timestamp": "2023-03-09T04:43:11.000Z"
}
```

## Use Cases

### Content Research
Quickly find all media resources on competitor websites to analyze their content strategy.

### Digital Asset Management
Create an inventory of all media files across your website for auditing purposes.

### SEO Analysis
Identify media optimization opportunities by analyzing file formats and sizes.

## Tips for Best Results

- Start with a reasonable `maxDepth` (2-3) and increase as needed
- Use the `maxPagesPerCrawl` limit for large websites to control costs
- Enable `followExternalLinks` only when you need to track media across multiple domains

## My Other Useful Actors

Looking for more powerful tools? Check out my other actors on the Apify platform:

- **[Search for "thenetaji"](https://apify.com/search?q=thenetaji)** on Apify to see my complete collection

Each tool is built with performance and reliability in mind, focusing on solving real-world data extraction challenges with minimal overhead.

## Support & Feedback

Found a bug or need help? Contact me through the Apify platform or open an issue in the actor's GitHub repository.

Your feedback helps make this tool better for everyone!