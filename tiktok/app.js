import { Actor, log } from "apify";
import {
  initializeActorAndGetInput,
  createProxyConfig,
} from "./shared/utils.js";
import { TikTok } from "./main.js";
import { detectTikTokType } from "./shared/utils.js";
import {
  InitializationError,
  ProxyConfigError,
  DataProcessingError,
} from "./shared/error.js";

if(process.env.NODE_ENV == "production"){
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

    let proxyUrl = null;
    if (!useApifyProxy || !test) {
      proxyUrl = await createProxyConfig(apifyProxyGroups, apifyProxyCountry);
      log.info(`Using proxy: ${proxyUrl}`);
    } else {
      log.info(
        "Skipping proxy as Apify Proxy is enabled or running in test mode.",
      );
    }

    const app = new TikTok();
    const postUrls = [];
    const profileUrls = [];

    log.info(`Processing ${urls.length} URL(s)...`);

    for (const { url } of urls) {
      const type = detectTikTokType(url);
      log.info(`Detected ${type} for URL: ${url}`);

      if (type === "post") {
        postUrls.push(url);
      } else if (type === "profile") {
        profileUrls.push(url);
      } else {
        log.warn(`Skipping unknown URL format: ${url}`);
      }
    }

    if (postUrls.length > 0) {
      log.info(`Processing ${postUrls.length} TikTok post(s)...`);
      await processPostData(app, postUrls, proxyUrl);
    } else {
      log.info("No post URLs detected.");
    }

    if (profileUrls.length > 0) {
      log.info(`Processing ${profileUrls.length} TikTok profile(s)...`);
      await processProfileData(app, profileUrls, proxyUrl);
    } else {
      log.info("No profile URLs detected.");
    }

    await Actor.setStatusMessage("Processing complete. Saving data...");
    log.info("Actor execution completed successfully.");
    await Actor.exit("Scraping complete");
  } catch (error) {
    handleErrors(error);
  }
}

async function processPostData(app, urls, proxyUrl) {
  try {
    await Actor.setStatusMessage(`completed ${urls.length} profiles`);
    log.info(`Fetching data for ${urls.length} post(s)...`);
    const postPromises = urls.map(async (url) => {
      log.debug(`Fetching post data for: ${url} with proxy: ${proxyUrl}`);
      const data = await app.getPostData(url, proxyUrl);
      log.debug(`Raw post data for ${url}: ${JSON.stringify(data, null, 2)}`);

      const flattenedData = {
        videoId: data.videoId,
        description: data.description,
        createTime: data.createTime,
        videoUrl: data.video.playUrl,
        coverImage: data.video.cover,
        bitrate: data.video.bitrate,
        quality: data.video.quality,
        format: data.video.format,
        authorId: data.author.id,
        authorUsername: data.author.username,
        authorNickname: data.author.nickname,
        authorVerified: data.author.verified,
        musicId: data.music.id,
        musicTitle: data.music.title,
        musicUrl: data.music.playUrl,
        likes: data.stats.likes,
        shares: data.stats.shares,
        comments: data.stats.comments,
        plays: data.stats.plays,
      };

      log.debug(
        `Processed post data for ${url}: ${JSON.stringify(flattenedData, null, 2)}`,
      );
      await Actor.pushData(flattenedData);
    });

    await Promise.all(postPromises);
    log.info("All post data processed successfully.");
  } catch (error) {
    log.error(`Error processing post data: ${error.message}`);
    log.debug(`Stack trace: ${error.stack}`);
    throw new DataProcessingError(
      `Failed to process post data: ${error.message}`,
    );
  }
}

async function processProfileData(app, urls, proxyUrl) {
  try {
    log.info(`Fetching data for ${urls.length} profile(s)...`);
    await Actor.setStatusMessage(`completed ${urls.length} profiles`);
    const profilePromises = urls.map(async (url) => {
      log.debug(`Fetching profile data for: ${url} with proxy: ${proxyUrl}`);
      const data = await app.getUserProfileData(url, proxyUrl);
      log.debug(
        `Raw profile data for ${url}: ${JSON.stringify(data, null, 2)}`,
      );

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
      };

      log.debug(
        `Processed profile data for ${url}: ${JSON.stringify(flattenedProfile, null, 2)}`,
      );
      await Actor.pushData(flattenedProfile);
    });

    await Promise.all(profilePromises);
    log.info("All profile data processed successfully.");
  } catch (error) {
    log.error(`Error processing profile data: ${error.message}`);
    log.debug(`Stack trace: ${error.stack}`);
    throw new DataProcessingError(
      `Failed to process profile data: ${error.message}`,
    );
  }
}

function handleErrors(error) {
  if (error instanceof InitializationError) {
    log.error(`Initialization error: ${error.message}`);
  } else if (error instanceof ProxyConfigError) {
    log.error(`Proxy configuration error: ${error.message}`);
  } else if (error instanceof DataProcessingError) {
    log.error(`Data processing error: ${error.message}`);
  } else {
    log.error(`Unexpected error: ${error.message}`);
  }

  log.debug(`Full error stack: ${error.stack}`);
  Actor.fail("An error occurred", { timeoutSec: 0 });
}

initializeActor();
