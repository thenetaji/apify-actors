# Video Download Link Crawler

This Apify actor helps you find and download videos from websites by crawling through pages starting from a provided URL.

## Features

- Crawl websites from a given start URL
- Find video links using customizable regular expressions
- Control crawl depth to limit resource usage
- Export results in various formats (JSON, CSV, Excel, HTML, XML)
- Optionally download found videos

## Input Parameters

| Parameter            | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| `startUrls`          | Array   | List of URLs to start crawling from                        |
| `urlRegexps`         | Array   | Regular expressions for URLs to follow (optional)          |
| `videoLinkRegexps`   | Array   | Regular expressions for identifying video links (optional) |
| `maxCrawlDepth`      | Number  | Maximum depth to crawl (default: 1)                        |
| `includeUrlGlobs`    | Array   | Only crawl URLs matching these patterns (optional)         |
| `excludeUrlGlobs`    | Array   | Don't crawl URLs matching these patterns (optional)        |
| `downloadVideos`     | Boolean | Whether to download found videos (default: false)          |
| `outputFormat`       | String  | Format for output data (json, csv, excel, html, xml)       |
| `maxConcurrency`     | Number  | Maximum concurrent requests (default: 10)                  |
| `maxRequestRetries`  | Number  | Maximum request retries (default: 3)                       |
| `proxyConfiguration` | Object  | Proxy settings for the crawler                             |

## Output

The actor outputs a dataset containing:

- Source URL where the video was found
- Video URL
- Page title
- Timestamp when found

If `downloadVideos` is enabled, the actor will also download the videos to the key-value store.

## API

This actor can be used via the Apify API with the following endpoint:
