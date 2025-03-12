import { HttpsProxyAgent } from "https-proxy-agent";
import UserAgent from "user-agents";
import * as cheerio from "cheerio";
import { Actor, log } from "apify";
import { TikTok } from "./main.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
} from "../shared/utils.js";
import {
  InitializationError,
  ProxyConfigError,
  DataProcessingError,
  NetworkError,
  DataExtractionError,
} from "../shared/error.js";

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

async function initializeActor() {
  try {
    log.info("Initializing actor...");
    const inputValues = await initializeActorAndGetInput();
    log.debug(`Received input: ${JSON.stringify(inputValues, null, 2)}`);

    const {
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, apifyProxyCountry },
      test,
    } = inputValues;

    // Setup proxy configuration
    let proxyUrl = null;
    if (!test && useApifyProxy) {
      try {
        proxyUrl = await createProxyConfig(apifyProxyGroups, apifyProxyCountry);
        log.info(`Proxy configured: ${proxyUrl ? "Successfully" : "None"}`);
        if (DEBUG_VERBOSE && proxyUrl) {
          log.debug(`Using proxy: ${proxyUrl}`);
        }
      } catch (error) {
        log.error(`Proxy configuration failed: ${error.message}`);
        throw new ProxyConfigError(
          `Failed to configure proxy: ${error.message}`,
        );
      }
    } else {
      log.info(
        "Skipping proxy as Apify Proxy is disabled or running in test mode",
      );
    }

    // Initialize TikTok scraper
    const app = new TikTok();
    const postUrls = [];
    const profileUrls = [];

    log.info(`Processing ${urls.length} URL(s)...`);
    await Actor.setStatusMessage(`Processing ${urls.length} TikTok URLs...`);

    // Sort URLs by type
    for (const { url } of urls) {
      try {
        const type = app.determineUrlType(url);
        log.info(`Detected ${type} for URL: ${url}`);

        if (type === "post") {
          postUrls.push(url);
        } else if (type === "profile") {
          profileUrls.push(url);
        } else {
          log.warn(`Skipping unknown URL format: ${url}`);
        }
      } catch (error) {
        log.error(`Failed to process URL ${url}: ${error.message}`);
      }
    }

    // Process posts
    if (postUrls.length > 0) {
      log.info(`Processing ${postUrls.length} TikTok post(s)...`);
      await Actor.setStatusMessage(
        `Processing ${postUrls.length} TikTok posts...`,
      );
      await processPostData(app, postUrls, proxyUrl);
    } else {
      log.info("No post URLs detected.");
    }

    // Process profiles
    if (profileUrls.length > 0) {
      log.info(`Processing ${profileUrls.length} TikTok profile(s)...`);
      await Actor.setStatusMessage(
        `Processing ${profileUrls.length} TikTok profiles...`,
      );
      await processProfileData(app, profileUrls, proxyUrl);
    } else {
      log.info("No profile URLs detected.");
    }

    await Actor.setStatusMessage("Processing complete. Saving data...");
    log.info("Actor execution completed successfully.");
    await Actor.exit("Scraping complete");
  } catch (error) {
    await handleErrors(error);
  }
}

/**
 * Process TikTok post data
 * @param {TikTok} app - TikTok scraper instance
 * @param {string[]} urls - Array of post URLs
 * @param {string} proxyUrl - Proxy URL
 */
async function processPostData(app, urls, proxyUrl) {
  try {
    log.info(`Fetching data for ${urls.length} post(s)...`);
    const postPromises = urls.map(async (url, index) => {
      try {
        log.debug(
          `Fetching post data (${index + 1}/${urls.length}) for: ${url}`,
        );
        const startTime = Date.now();
        const data = await app.getPostData(url, proxyUrl);
        const duration = Date.now() - startTime;

        log.info(`Post data fetched in ${duration}ms for: ${url}`);
        log.debug(`Raw post data structure: ${Object.keys(data).join(", ")}`);

        if (DEBUG_VERBOSE) {
          log.debug(
            `Raw post data for ${url}: ${JSON.stringify(data, null, 2)}`,
          );
        }

        // Flatten data structure for Actor output
        const flattenedData = {
          videoId: data.videoId,
          description: data.description,
          createTime: data.createTime,
          videoUrl: data.video.playUrl,
          coverImage: data.video.cover,
          bitrate: data.video.bitrate,
          quality: data.video.quality,
          format: data.video.format,
          // Handle missing author data gracefully
          authorId: data.author?.id || null,
          authorUsername: data.author?.username || null,
          authorNickname: data.author?.nickname || null,
          authorVerified: data.author?.verified || false,
          // Handle missing music data gracefully
          musicId: data.music?.id || null,
          musicTitle: data.music?.title || null,
          musicUrl: data.music?.playUrl || null,
          // Stats
          likes: data.stats.likes,
          shares: data.stats.shares,
          comments: data.stats.comments,
          plays: data.stats.plays,
          // Add source URL and scraping timestamp
          sourceUrl: url,
          scrapedAt: new Date().toISOString(),
        };

        log.debug(`Pushing post data to dataset for: ${url}`);
        await Actor.pushData(flattenedData);
        return { url, success: true };
      } catch (error) {
        log.error(`Failed to fetch post data for ${url}: ${error.message}`);
        if (DEBUG_VERBOSE) {
          log.debug(`Error stack: ${error.stack}`);
        }
        await Actor.pushData({
          sourceUrl: url,
          success: false,
          errorMessage: error.message,
          scrapedAt: new Date().toISOString(),
        });
        return { url, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(postPromises);

    // Summarize results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.filter(
      (r) => r.status === "fulfilled" && !r.value.success,
    ).length;
    const errors = results.filter((r) => r.status === "rejected").length;

    log.info(
      `Post data processing summary: ${successful} successful, ${failed} failed, ${errors} errors`,
    );
    await Actor.setStatusMessage(
      `Completed processing ${urls.length} posts: ${successful} successful, ${failed + errors} failed`,
    );
  } catch (error) {
    log.error(`Error in batch processing post data: ${error.message}`);
    log.debug(`Stack trace: ${error.stack}`);
    throw new DataProcessingError(
      `Failed to process post data: ${error.message}`,
    );
  }
}

/**
 * Process TikTok profile data
 * @param {TikTok} app - TikTok scraper instance
 * @param {string[]} urls - Array of profile URLs
 * @param {string} proxyUrl - Proxy URL
 */
async function processProfileData(app, urls, proxyUrl) {
  try {
    log.info(`Fetching data for ${urls.length} profile(s)...`);
    const profilePromises = urls.map(async (url, index) => {
      try {
        log.debug(
          `Fetching profile data (${index + 1}/${urls.length}) for: ${url}`,
        );
        const startTime = Date.now();
        const data = await app.getUserProfileData(url, proxyUrl);
        const duration = Date.now() - startTime;

        log.info(`Profile data fetched in ${duration}ms for: ${url}`);
        log.debug(
          `Raw profile data structure: ${Object.keys(data).join(", ")}`,
        );

        if (DEBUG_VERBOSE) {
          log.debug(
            `Raw profile data for ${url}: ${JSON.stringify(data, null, 2)}`,
          );
        }

        // Flatten data structure for Actor output
        const flattenedProfile = {
          userId: data.userId,
          uniqueId: data.uniqueId,
          nickname: data.nickname,
          title: data.title,
          description: data.description,
          avatarLarge: data.avatar.large,
          avatarMedium: data.avatar.medium,
          avatarThumb: data.avatar.thumb,
          bioSignature: data.bio.signature,
          bioLink: data.bio.bioLink,
          createdAt: data.accountInfo.createdAt,
          verified: data.accountInfo.verified,
          region: data.accountInfo.region,
          privateAccount: data.accountInfo.privateAccount,
          followers: data.stats.followers,
          following: data.stats.following,
          likes: data.stats.likes,
          videos: data.stats.videos,
          // Add source URL and scraping timestamp
          sourceUrl: url,
          scrapedAt: new Date().toISOString(),
        };

        log.debug(`Pushing profile data to dataset for: ${url}`);
        await Actor.pushData(flattenedProfile);
        return { url, success: true };
      } catch (error) {
        log.error(`Failed to fetch profile data for ${url}: ${error.message}`);
        if (DEBUG_VERBOSE) {
          log.debug(`Error stack: ${error.stack}`);
        }
        await Actor.pushData({
          sourceUrl: url,
          success: false,
          errorMessage: error.message,
          scrapedAt: new Date().toISOString(),
        });
        return { url, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(profilePromises);

    // Summarize results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.filter(
      (r) => r.status === "fulfilled" && !r.value.success,
    ).length;
    const errors = results.filter((r) => r.status === "rejected").length;

    log.info(
      `Profile data processing summary: ${successful} successful, ${failed} failed, ${errors} errors`,
    );
    await Actor.setStatusMessage(
      `Completed processing ${urls.length} profiles: ${successful} successful, ${failed + errors} failed`,
    );
  } catch (error) {
    log.error(`Error in batch processing profile data: ${error.message}`);
    log.debug(`Stack trace: ${error.stack}`);
    throw new DataProcessingError(
      `Failed to process profile data: ${error.message}`,
    );
  }
}

/**
 * Handle errors during actor execution
 * @param {Error} error - The error to handle
 */
async function handleErrors(error) {
  if (error instanceof InitializationError) {
    log.error(`Initialization error: ${error.message}`);
  } else if (error instanceof ProxyConfigError) {
    log.error(`Proxy configuration error: ${error.message}`);
  } else if (error instanceof DataProcessingError) {
    log.error(`Data processing error: ${error.message}`);
  } else if (error instanceof NetworkError) {
    log.error(`Network error: ${error.message}`);
  } else if (error instanceof DataExtractionError) {
    log.error(`Data extraction error: ${error.message}`);
  } else {
    log.error(`Unexpected error: ${error.message}`);
  }

  await Actor.fail(`Process failed with: ${error.message}`);
}

initializeActor();
