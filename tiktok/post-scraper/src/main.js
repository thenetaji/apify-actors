import { HttpsProxyAgent } from "https-proxy-agent";
import UserAgent from "user-agents";
import * as cheerio from "cheerio";
import { log } from "apify";
import { NetworkError, DataExtractionError } from "../shared/error.js";

/**
 * thanks claude for adding debugging steps
 */

let DEBUG_RESPONSE_BODY;
let DEBUG_HTML_SNIPPETS;
let DEBUG_VERBOSE;
if (process.env.NODE_ENV === "production") {
  DEBUG_RESPONSE_BODY = true;
  DEBUG_HTML_SNIPPETS = true;
  DEBUG_VERBOSE = true;
  log.setLevel(log.LEVELS.INFO);
} else {
  log.setLevel(log.LEVELS.DEBUG);
}

export class TikTok {
  /**
   * Fetches data from a URL with timeout, retries and proxy support
   * @param {string} url The URL to fetch
   * @param {string} proxyUrl Optional proxy URL
   * @param {number} timeout Timeout in milliseconds
   * @param {number} retries Number of retry attempts
   * @returns {Promise<Response>} The fetch response
   */
  async fetchWithTimeout(url, proxyUrl, timeout = 10000, retries = 3) {
    log.info(`Starting fetch for URL: ${url}`);
    log.debug(
      `Fetch parameters - timeout: ${timeout}ms, retries: ${retries}, proxy: ${proxyUrl ? "configured" : "none"}`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const userAgent = new UserAgent().toString();

    let options = {
      headers: {
        "User-Agent": userAgent,
        Referer: "https://www.tiktok.com/",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    };

    if (proxyUrl) {
      log.debug(`Using proxy: ${proxyUrl}`);
      options.agent = new HttpsProxyAgent(proxyUrl);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        log.info(`Fetch attempt ${attempt}/${retries} for URL: ${url}`);
        log.debug(`Request headers: ${JSON.stringify(options.headers)}`);

        const startTime = Date.now();
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;

        clearTimeout(timeoutId);

        log.info(
          `Response received in ${responseTime}ms - Status: ${response.status} ${response.statusText}`,
        );

        if (DEBUG_VERBOSE) {
          log.debug(
            `Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`,
          );
        }

        // Validate and check response
        this._validateResponse(response);

        if (!response.ok) {
          throw new NetworkError(
            `HTTP Error: ${response.status} ${response.statusText}`,
            {
              status: response.status,
              statusText: response.statusText,
              url,
            },
          );
        }

        if (DEBUG_VERBOSE) {
          const contentType = response.headers.get("content-type");
          log.debug(`Response content type: ${contentType}`);

          if (DEBUG_RESPONSE_BODY) {
            const clone = response.clone();
            const body = await clone.text();
            log.debug(`Response body size: ${body.length} bytes`);

            if (contentType?.includes("json")) {
              try {
                const json = JSON.parse(body);
                log.debug(
                  `JSON response structure: ${Object.keys(json).join(", ")}`,
                );
              } catch (e) {
                log.debug(`Failed to parse response as JSON: ${e.message}`);
              }
            } else if (DEBUG_HTML_SNIPPETS && contentType?.includes("html")) {
              // Log just a snippet of the HTML for debugging
              log.debug(
                `HTML snippet (first 300 chars): ${body.substring(0, 300)}...`,
              );
            }
          }
        }

        return response;
      } catch (error) {
        const isAbortError = error.name === "AbortError";

        log.error(`Fetch attempt ${attempt} failed:`, {
          url,
          error: error.message,
          type: error.constructor.name,
          isTimeout: isAbortError,
          stack: DEBUG_VERBOSE ? error.stack : undefined,
        });

        if (attempt === retries) {
          log.error(`All ${retries} retry attempts failed for URL: ${url}`);
          throw new NetworkError(
            `Max retries (${retries}) reached when fetching ${url}`,
            {
              cause: error,
              isTimeout: isAbortError,
            },
          );
        }

        // Exponential backoff between retries
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        log.info(`Waiting ${backoffTime}ms before retry ${attempt + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
  }

  /**
   * Validates the response and logs potential issues
   * @private
   * @param {Response} response - The fetch response
   */
  _validateResponse(response) {
    // Check for common HTTP status codes
    if (response.status === 403) {
      log.warn(
        `Received 403 Forbidden - Possible rate limiting or IP blocking`,
      );
    } else if (response.status === 429) {
      log.warn(`Received 429 Too Many Requests - Rate limited by TikTok`);
    } else if (response.status >= 500) {
      log.warn(
        `Received server error ${response.status} - TikTok server issue`,
      );
    }

    // Check for important headers
    const contentType = response.headers.get("content-type");
    if (!contentType) {
      log.warn(`No content-type header in response`);
    } else if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/json")
    ) {
      log.warn(`Unexpected content type: ${contentType}`);
    }

    // Check for possible bot detection (cloudflare, etc.)
    if (response.headers.get("cf-ray")) {
      log.debug(`Cloudflare headers detected in response`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) < 1000) {
      log.warn(
        `Suspiciously small response (${contentLength} bytes) - possible bot detection page`,
      );
    }
  }

  /**
   * Extracts and validates JSON data from HTML response
   * @private
   * @param {string} html - HTML content
   * @param {string} selector - CSS selector for the JSON data
   * @returns {Object} Parsed JSON data
   * @throws {DataExtractionError} If data cannot be extracted or parsed
   */
  _extractJsonFromHtml(html, selector = "#__UNIVERSAL_DATA_FOR_REHYDRATION__") {
    log.debug(`Extracting JSON data using selector: ${selector}`);

    const $ = cheerio.load(html);
    const jsonData = $(selector).text().trim();

    if (!jsonData) {
      // Try to find what selectors are available for debugging
      const availableScriptIds = Array.from($("script"))
        .slice(0, 5)
        .map((el) => $(el).attr("id"))
        .filter(Boolean)
        .join(", ");

      log.error(
        `JSON data not found. Available selectors: ${availableScriptIds}`,
      );

      let errorDetails = {
        message: `JSON data not found in HTML using selector: ${selector}`,
      };

      if (DEBUG_HTML_SNIPPETS) {
        errorDetails.htmlSnippet = html.substring(0, 500);
      }

      throw new DataExtractionError(errorDetails.message, errorDetails);
    }

    log.debug(`JSON data found, length: ${jsonData.length} chars`);

    try {
      const parsedData = JSON.parse(jsonData);
      log.debug(
        `JSON successfully parsed, top-level keys: ${Object.keys(parsedData).join(", ")}`,
      );
      return parsedData;
    } catch (error) {
      log.error(`Failed to parse JSON data: ${error.message}`);

      if (DEBUG_HTML_SNIPPETS) {
        log.debug(
          `JSON snippet causing error (first 200 chars): ${jsonData.substring(0, 200)}...`,
        );
      }

      throw new DataExtractionError("Invalid JSON format in extracted data", {
        cause: error,
      });
    }
  }

  /**
   * Fetches and parses user profile data
   * @param {string} url - The user profile URL
   * @param {string} proxyUrl - Optional proxy URL
   * @returns {Promise<Object>} Structured user profile data
   */
  async getUserProfileData(url, proxyUrl) {
    const methodStart = Date.now();
    log.info(`Starting to fetch profile from ${url}`);

    try {
      log.debug(`Initiating request to TikTok profile URL: ${url}`);
      const response = await this.fetchWithTimeout(url, proxyUrl);
      const html = await response.text();

      log.debug(
        `Received HTML response (${html.length} bytes), starting to parse`,
      );

      if (html.length < 1000) {
        log.warn(
          `Suspiciously small HTML response (${html.length} bytes) - might be a captcha or error page`,
        );
        if (DEBUG_HTML_SNIPPETS) {
          log.debug(
            `HTML content: ${html.substring(0, Math.min(html.length, 1000))}`,
          );
        }
      }

      const parsedData = this._extractJsonFromHtml(html);

      // Check if the expected data structure exists
      const userData = parsedData["__DEFAULT_SCOPE__"]["webapp.user-detail"];

      if (!userData) {
        log.error("Expected data structure not found in parsed JSON");

        // Enhanced debugging information
        if (parsedData["__DEFAULT_SCOPE__"]) {
          log.debug(
            `Available keys in __DEFAULT_SCOPE__: ${Object.keys(
              parsedData["__DEFAULT_SCOPE__"],
            ).join(", ")}`,
          );
        } else {
          log.debug(`__DEFAULT_SCOPE__ key not found in parsed data`);
        }

        throw new DataExtractionError(
          "User data structure has changed or is missing",
        );
      }

      if (!userData?.userInfo?.user) {
        log.error("User object not found in userInfo structure");
        log.debug(
          `Available keys in userData: ${Object.keys(userData).join(", ")}`,
        );
        throw new DataExtractionError(
          "User profile data structure has changed or is missing.",
        );
      }

      const user = userData.userInfo.user;
      log.debug(`Found user data for: ${user.uniqueId || "unknown"}`);

      const profileData = {
        userId: user.id || null,
        uniqueId: user.uniqueId || null,
        nickname: user.nickname || null,
        title: userData.shareMeta?.title || null,
        description: userData.shareMeta?.desc || null,
        avatar: {
          large: user.avatarLarger || null,
          medium: user.avatarMedium || null,
          thumb: user.avatarThumb || null,
        },
        bio: {
          signature: user.signature || null,
          bioLink: user.bioLink?.link || null,
        },
        accountInfo: {
          createdAt: user.createTime
            ? new Date(user.createTime * 1000).toISOString()
            : null,
          verified: user.verified || false,
          region: user.region || null,
          privateAccount: user.privateAccount || false,
        },
        stats: {
          followers: userData.userInfo.stats?.followerCount || 0,
          following: userData.userInfo.stats?.followingCount || 0,
          likes: userData.userInfo.stats?.heartCount || 0,
          videos: userData.userInfo.stats?.videoCount || 0,
        },
      };

      // Log successful data extraction
      log.info(
        `Successfully extracted profile data for user: ${profileData.uniqueId}`,
      );
      log.debug(`Stats: ${JSON.stringify(profileData.stats)}`);

      const methodDuration = Date.now() - methodStart;
      log.info(`getUserProfileData completed in ${methodDuration}ms`);

      return profileData;
    } catch (error) {
      const methodDuration = Date.now() - methodStart;
      log.error(`getUserProfileData failed after ${methodDuration}ms:`, {
        url,
        error: error.message,
        type: error.constructor.name,
        stack: DEBUG_VERBOSE ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Fetches and parses post data
   * @param {string} url - The post URL
   * @param {string} proxyUrl - Optional proxy URL
   * @returns {Promise<Object>} Structured post data
   */
  async getPostData(url, proxyUrl) {
    const methodStart = Date.now();
    log.info(`Starting to fetch post from ${url}`);

    try {
      log.debug(`Initiating request to TikTok post URL: ${url}`);
      const response = await this.fetchWithTimeout(url, proxyUrl);
      const html = await response.text();

      log.debug(
        `Received HTML response (${html.length} bytes), starting to parse`,
      );

      if (html.length < 1000) {
        log.warn(
          `Suspiciously small HTML response (${html.length} bytes) - might be a captcha or error page`,
        );
        if (DEBUG_HTML_SNIPPETS) {
          log.debug(
            `HTML content: ${html.substring(0, Math.min(html.length, 1000))}`,
          );
        }
      }

      const parsedData = this._extractJsonFromHtml(html);

      // Check for presence of the post data structure with improved path checking
      const defaultScope = parsedData["__DEFAULT_SCOPE__"];
      if (!defaultScope) {
        log.error(`__DEFAULT_SCOPE__ missing in parsed data`);
        throw new DataExtractionError(
          "Expected data structure not found - __DEFAULT_SCOPE__ missing",
        );
      }

      let videoDetail = defaultScope["webapp.video-detail"];
      if (!videoDetail) {
        log.warning(`webapp.video-detail missing in __DEFAULT_SCOPE__`);
        log.debug(`Available keys: ${Object.keys(defaultScope).join(", ")}`);

        log.warning(
          "Expected data structure not found - webapp.video-detail missing",
        );

        log.debug("Trying with webapp.reflow.video.detail...");

        videoDetail = defaultScope["webapp.reflow.video.detail"];

        if (!videoDetail) {
          log.error(`webapp.reflow.video.detail missing in __DEFAULT_SCOPE__`);

          throw new DataExtractionError(
            "Expected data structure not found - webapp.reflow.video.detail missing. All extraction method failed",
          );
        }
      }

      const itemInfo = videoDetail.itemInfo;
      if (!itemInfo) {
        log.error(`itemInfo missing in webapp.video-detail`);
        log.debug(`Available keys: ${Object.keys(videoDetail).join(", ")}`);
        throw new DataExtractionError(
          "Expected data structure not found - itemInfo missing",
        );
      }

      const item = itemInfo.itemStruct;
      if (!item) {
        log.error(`itemStruct missing in itemInfo`);
        log.debug(`Available keys: ${Object.keys(itemInfo).join(", ")}`);
        throw new DataExtractionError(
          "Expected data structure not found - itemStruct missing",
        );
      }

      log.debug(`Found post data for video ID: ${item.id || "unknown"}`);

      // Validate critical post data fields
      if (!item.video) {
        log.error("Video object missing in post data");
        throw new DataExtractionError("Video object missing in post data");
      }

      if (!item.author) {
        log.warn("Author object missing in post data");
      }

      if (!item.stats) {
        log.warn("Stats object missing in post data");
      }

      // Extract and structure post data with null fallbacks for all fields
      const postData = {
        videoId: item.id || null,
        description: item.desc || null,
        createTime: item.createTime
          ? new Date(item.createTime * 1000).toISOString()
          : null,
        video: {
          width: item.video?.width || 0,
          height: item.video?.height || 0,
          duration: item.video?.duration || 0,
          cover: item.video?.cover || null,
          playUrl: item.video?.playAddr || null,
          bitrate: item.video?.bitrate || 0,
          quality: item.video?.videoQuality || null,
          format: item.video?.format || null,
        },
        author: item.author
          ? {
              id: item.author.id || null,
              username: item.author.uniqueId || null,
              nickname: item.author.nickname || null,
              verified: item.author.verified || false,
            }
          : null,
        music: item.music
          ? {
              id: item.music.id || null,
              title: item.music.title || null,
              playUrl: item.music.playUrl || null,
            }
          : null,
        stats: {
          likes: item.stats?.diggCount || 0,
          shares: item.stats?.shareCount || 0,
          comments: item.stats?.commentCount || 0,
          plays: item.stats?.playCount || 0,
        },
      };

      //log.debug(`Post data extracted : ${JSON.stringify(postData)}`);

      // Log successful data extraction
      log.info(`Successfully extracted data for video ID: ${postData.videoId}`);
      if (DEBUG_VERBOSE) {
        log.debug(`Post stats: ${JSON.stringify(postData.stats)}`);
        log.debug(
          `Video details: Width=${postData.video.width}, Height=${postData.video.height}, Duration=${postData.video.duration}`,
        );
      }

      const methodDuration = Date.now() - methodStart;
      log.info(`getPostData completed in ${methodDuration}ms`);

      return postData;
    } catch (error) {
      const methodDuration = Date.now() - methodStart;
      log.error(`getPostData failed after ${methodDuration}ms:`, {
        url,
        error: error.message,
        type: error.constructor.name,
        stack: DEBUG_VERBOSE ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Checks if a URL is valid for processing
   * @param {string} url - The URL to validate
   * @returns {boolean} - Whether the URL is valid
   */
  isValidUrl(url) {
    log.debug(`Validating URL: ${url}`);

    if (!url) {
      log.warn("URL is empty or undefined");
      return false;
    }

    // Check for common TikTok URL patterns
    const validDomains = [
      "tiktok.com",
      "vt.tiktok.com",
      "m.tiktok.com",
      "www.tiktok.com",
    ];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      const isValidDomain = validDomains.some((validDomain) =>
        domain.endsWith(validDomain),
      );

      if (!isValidDomain) {
        log.warn(
          `Invalid domain: ${domain}, expected one of: ${validDomains.join(", ")}`,
        );
        return false;
      }

      log.debug(`URL validated successfully: ${url}`);
      return true;
    } catch (error) {
      log.error(`URL validation failed: ${error.message}`, { url });
      return false;
    }
  }

  /**
   * Determines if a URL is a user profile or a post
   * @param {string} url - The TikTok URL
   * @returns {string} - 'profile' or 'post'
   * @throws {Error} If URL type cannot be determined
   */
  determineUrlType(url) {
    log.debug(`Determining URL type for: ${url}`);

    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid TikTok URL: ${url}`);
    }

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Short URL format (vt.tiktok.com) is always a post
      if (urlObj.hostname === "vt.tiktok.com") {
        log.debug(`URL determined to be a short-form post URL`);
        return "post";
      }

      // Check for profile URL pattern (/@username)
      if (pathname.startsWith("/@") && !pathname.includes("/video/")) {
        log.debug(`URL determined to be a profile URL: ${pathname}`);
        return "profile";
      }

      // Check for post URL pattern (/@username/video/123456)
      if (pathname.includes("/video/")) {
        log.debug(`URL determined to be a post URL: ${pathname}`);
        return "post";
      }

      log.warn(
        `Couldn't determine URL type clearly, defaulting to post: ${url}`,
      );
      return "post";
    } catch (error) {
      log.error(`URL type determination failed: ${error.message}`, { url });
      throw new Error(`Failed to determine URL type: ${error.message}`);
    }
  }

  /**
   * Process a TikTok URL and return appropriate data
   * @param {string} url - The TikTok URL to process
   * @param {string} proxyUrl - Optional proxy URL
   * @returns {Promise<Object>} - The scraped data
   */
  async process(url, proxyUrl) {
    log.info(`Processing TikTok URL: ${url}`);

    try {
      const urlType = this.determineUrlType(url);

      switch (urlType) {
        case "profile":
          log.info(`Processing as profile URL`);
          return await this.getUserProfileData(url, proxyUrl);

        case "post":
          log.info(`Processing as post URL`);
          return await this.getPostData(url, proxyUrl);

        default:
          throw new Error(`Unknown URL type: ${urlType}`);
      }
    } catch (error) {
      log.error(`Failed to process URL: ${url}`, {
        error: error.message,
        type: error.constructor.name,
        stack: DEBUG_VERBOSE ? error.stack : undefined,
      });

      // Add some context to the error for better debugging
      if (error instanceof NetworkError) {
        // Already has proper context
        throw error;
      } else if (error instanceof DataExtractionError) {
        // Already has proper context
        throw error;
      } else {
        // Wrap unknown errors
        throw new Error(`TikTok processing failed: ${error.message}`);
      }
    }
  }
}

// Example usage with environment variable based debugging
/*
// To run with verbose debugging:
// DEBUG_VERBOSE=true DEBUG_HTML_SNIPPETS=true node your-script.js

import { TikTok } from './improved-tiktok.js';

(async () => {
  const tiktok = new TikTok();
  const proxyUrl = process.env.PROXY_URL; // Set your proxy via environment variable
  
  try {
    // Process a post
    const postData = await tiktok.process("https://vt.tiktok.com/ZSMy827Qe/", proxyUrl);
    console.log("Post data:", postData);
    
    // Process a profile
    const profileData = await tiktok.process("https://www.tiktok.com/@barstoolsports", proxyUrl);
    console.log("Profile data:", profileData);
  } catch (error) {
    console.error("Processing error:", error);
  }
})();
*/
