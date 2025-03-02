import { HttpsProxyAgent } from "https-proxy-agent";
import * as cheerio from "cheerio";
import { log } from "apify";
import { NetworkError, DataExtractionError } from "./shared/error.js";

log.setLevel(log.LEVELS.DEBUG);

export class TikTok {
  async getUserProfileData(url, proxyUrl) {
    let agent;
    const option = {};

    try {
      log.debug(`Fetching user profile data from: ${url}`);
      if (proxyUrl) {
        log.debug(`Using proxy: ${proxyUrl}`);
        agent = new HttpsProxyAgent(proxyUrl);
        option.agent = agent;
      }

      const response = await fetch(url, option);
      log.debug(`Response status: ${response.status} - ${response.statusText}`);

      if (!response.ok) {
        throw new NetworkError({
          status: response.status,
          statusText: response.statusText,
        });
      }

      const html = await response.text();

      const $ = cheerio.load(html);
      const jsonData = $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text().trim();
      
      if (!jsonData) {
        throw new DataExtractionError({ message: "JSON data not found in HTML." });
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (error) {
        log.error("JSON parsing failed", error);
        throw new DataExtractionError({ message: "Invalid JSON format." });
      }

      const userData = parsedData["__DEFAULT_SCOPE__"]?.["webapp.user-detail"];

      if (!userData || !userData.userInfo?.user) {
        throw new DataExtractionError({ message: "User profile data structure has changed or is missing." });
      }

      log.debug("User data successfully extracted.");

      return {
        userId: userData.userInfo.user.id || null,
        uniqueId: userData.userInfo.user.uniqueId || null,
        nickname: userData.userInfo.user.nickname || null,
        title: userData.shareMeta?.title || null,
        description: userData.shareMeta?.desc || null,
        avatar: {
          large: userData.userInfo.user.avatarLarger || null,
          medium: userData.userInfo.user.avatarMedium || null,
          thumb: userData.userInfo.user.avatarThumb || null,
        },
        bio: {
          signature: userData.userInfo.user.signature || null,
          bioLink: userData.userInfo.user.bioLink?.link || null,
        },
        accountInfo: {
          createdAt: userData.userInfo.user.createTime || null,
          verified: userData.userInfo.user.verified || false,
          region: userData.userInfo.user.region || null,
          privateAccount: userData.userInfo.user.privateAccount || false,
        },
        stats: {
          followers: userData.userInfo.stats?.followerCount || 0,
          following: userData.userInfo.stats?.followingCount || 0,
          likes: userData.userInfo.stats?.heartCount || 0,
          videos: userData.userInfo.stats?.videoCount || 0,
        },
      };
    } catch (error) {
      log.error("Error in getUserProfileData:", error);
      throw error;
    }
  }

  async getPostData(url, proxyUrl) {
    let agent;
    const option = {};

    try {
      log.debug(`Fetching post data from: ${url}`);
      if (proxyUrl) {
        log.debug(`Using proxy: ${proxyUrl}`);
        agent = new HttpsProxyAgent(proxyUrl);
        option.agent = agent;
      }

      const response = await fetch(url, option);
      log.debug(`Response status: ${response.status} - ${response.statusText}`);

      if (!response.ok) {
        throw new NetworkError({
          status: response.status,
          statusText: response.statusText,
        });
      }

      const html = await response.text();
      
      const $ = cheerio.load(html);
      const jsonData = $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text().trim();

      if (!jsonData) {
        throw new DataExtractionError({ message: "JSON data not found in HTML." });
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (error) {
        log.error("JSON parsing failed", error);
        throw new DataExtractionError({ message: "Invalid JSON format." });
      }

      const item = parsedData["__DEFAULT_SCOPE__"]?.["webapp.video-detail"]?.itemInfo?.itemStruct;

      if (!item) {
        throw new DataExtractionError({ message: "Post data structure has changed or is missing." });
      }

      log.debug("Post data successfully extracted.");

      return {
        videoId: item.id,
        description: item.desc,
        createTime: new Date(item.createTime * 1000).toISOString(),
        video: {
          width: item.video.width,
          height: item.video.height,
          duration: item.video.duration,
          cover: item.video.cover,
          playUrl: item.video.playAddr,
          bitrate: item.video.bitrate,
          quality: item.video.videoQuality,
          format: item.video.format,
        },
        author: {
          id: item.author.id,
          username: item.author.uniqueId,
          nickname: item.author.nickname,
          verified: item.author.verified,
        },
        music: {
          id: item.music.id,
          title: item.music.title,
          playUrl: item.music.playUrl,
        },
        stats: {
          likes: item.stats.diggCount,
          shares: item.stats.shareCount,
          comments: item.stats.commentCount,
          plays: item.stats.playCount,
        },
      };
    } catch (error) {
      log.error("Error in getPostData:", error);
      throw error;
    }
  }
}

/**(async () => {
  const app = new TikTok();
  const proxyUrl = null;

  try {
    const postData = await app.getPostData("https://vt.tiktok.com/ZSMy827Qe/", proxyUrl);
    console.log("postData", postData);
  } catch (error) {
    console.error("Error fetching post data:", error);
  }

  try {
    const profileData = await app.getUserProfileData("https://www.tiktok.com/@barstoolsports", proxyUrl);
    console.log("profileData", profileData);
  } catch (error) {
    console.error("Error fetching user profile data:", error);
  }
})();**/