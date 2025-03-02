import { Actor, log } from "apify";
import fs from "fs/promises";
import download from "./shared/download.js";

/**
 * @return {Promise<string>} input - The input entered through apify console
 */
export const initializeActorAndGetInput = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    log.debug("Actor initialized with input", input);
    return input;
  } catch (error) {
    log.error("Failed to initialize actor:", error);
    throw error;
  }
};

/**
 * @param {array} type - Type of proxy to use.
 * @param {string} country - The country from which the data should be fetched if left empty apify would use any random
 * return {string | null} proxyUrl
 */
export const createProxyConfig = async (type, country) => {
  try {
    const proxyConfig = await Actor.createProxyConfiguration({
      groups: type,
      countryCode: country || undefined,
    });

    return proxyConfig ? proxyConfig.newUrl() : null;
  } catch (error) {
    log.error("Failed to create proxy configuration:", error);
    throw error;
  }
};

/**
 * @param {string} fileTitle
 * @param {string} filePath
 * @param {string} contentType
 */
export const saveFileToDB = async (fileTitle, filePath, contentType) => {
  log.debug(
    `Actor params in saveFileToDB: fileTitle: ${fileTitle} & filePath: ${filePath}`,
  );

  const fileBuffer = await fs.readFile(filePath);
  const keyValueStore = await Actor.openKeyValueStore();

  await keyValueStore.setValue(fileTitle, fileBuffer, { contentType });

  const downloadUrl = `https://api.apify.com/v2/key-value-stores/${keyValueStore.id}/records/${encodeURIComponent(fileTitle)}`;

  return { fileTitle, downloadUrl };
};


export function detectTikTokType(url) {
  const urlObj = new URL(url);
  
  // If it's a short URL, assume it's a video post
  if (urlObj.hostname === "vt.tiktok.com") {
    return "post"; 
  }

  // Check the pathname structure
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  
  if (pathParts.length === 1 && pathParts[0].startsWith("@")) {
    return "profile"; // Profile URL
  }
  
  if (pathParts.length === 3 && pathParts[1] === "video") {
    return "post"; // Video URL
  }

  return "unknown"; // Unexpected URL format
}
