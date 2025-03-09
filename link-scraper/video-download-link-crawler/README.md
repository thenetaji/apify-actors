# Video Download Link Crawler

Discover and extract direct video download links from websites without the resource overhead of browser-based solutions.

## Why use this crawler?

Finding videos across websites can be time-consuming and resource-intensive. This actor automates the process using lightweight HTTP requests to identify and extract video links efficiently.

**Ideal for:**
- Digital marketers collecting video content
- Content researchers finding multimedia resources
- Developers building media aggregation tools
- Anyone needing to catalog videos across websites

## Core functionality

1. **Target your sources** - Add starting URLs where you want to find videos
2. **Set crawl parameters** - Configure depth and page limits
3. **Run the crawler** - Let it discover embedded and downloadable videos
4. **Collect the links** - Get a comprehensive dataset of all discovered videos

The crawler intelligently follows links while identifying videos embedded in HTML and JavaScript.

## Key advantages

- ⚡ **Lightweight operation**: Uses CheerioCrawler for minimal resource consumption
- 🔄 **Configurable depth**: Control how far the crawler follows links
- 🎯 **Smart detection**: Finds video links hidden in various HTML elements
- 📊 **Organized output**: Get results structured by source URL

## Setup options

| Parameter | Type | Purpose |
|-----------|------|---------|
| `startUrls` | Array | Initial URLs to begin crawling |
| `maxDepth` | Number | How many links deep to crawl (default: 2) |
| `maxPagesPerCrawl` | Number | Limit on total pages to process |

## Results structure

```json
{
  "sourceUrl": "https://example.com/page",
  "pageTitle": "Example Page",
  "mediaLinks": [
    {
      "type": "video",
      "url": "https://example.com/video.mp4",
    }
  ],
  "timestamp": "2023-03-09T04:51:52.000Z"
}
```

## Practical applications

### Content research
Quickly find all video resources on websites to analyze content strategies.

### Digital asset discovery
Create inventories of videos across websites for reference and research.

### Media collection
Build databases of video content from multiple sources automatically.

## Advanced usage tips

- Start with a reasonable `maxDepth` (2-3) and increase as needed
- Use the `maxPagesPerCrawl` limit for large websites to control costs
- For very large sites, consider running multiple targeted crawls instead of one large one

## Explore my other actors

Need additional web automation tools? I've developed several specialized actors:

- **[Browse all my actors](https://apify.com/search?q=thenetaji)** on the Apify marketplace

All tools are designed for real-world data challenges with reliability and performance as top priorities.

## Get help & share feedback

Having trouble or want to suggest improvements? Reach out through Apify or leave comments on the actor page.

I actively maintain this crawler and value user input for future updates!