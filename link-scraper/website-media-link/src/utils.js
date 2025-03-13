import { URL } from "url";

/**
 * Normalizes a URL by removing trailing slashes and query parameters if needed
 */
export const normalizeUrl = (url) => {
  try {
    return url.trim();
  } catch (e) {
    return url;
  }
};

/**
 * Creates a function to detect if a URL points to a media file based on regex patterns and media type
 */
export const createMediaLinkDetector = (mediaType, customPatterns = []) => {
  // Define patterns based on media type
  let defaultPatterns;

  switch (mediaType) {
    case "video":
      defaultPatterns = [
        /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)(\?.*)?$/i,
        /\/video\/|\/videos\/|\/watch\?v=|\/embed\/|player\.php/i,
        /\/(get_video|video_url|playback|stream)\/|\/(video|media)\.php/i,
      ];
      break;
    case "audio":
      defaultPatterns = [
        /\.(mp3|wav|ogg|aac|flac|m4a)(\?.*)?$/i,
        /\/audio\/|\/sound\/|\/listen\/|\/track\//i,
        /\/(get_audio|audio_url|stream)\/|\/(audio|sound)\.php/i,
      ];
      break;
    case "image":
      defaultPatterns = [
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i,
        /\/images\/|\/img\/|\/photos\/|\/gallery\//i,
        /\/(get_image|image_url)\/|\/(image|photo)\.php/i,
      ];
      break;
    case "apk":
      defaultPatterns = [
        /\.(apk|xapk)(\?.*)?$/i, // Match .apk and .xapk file extensions
        /\/download\/|\/apk\//i, // Common APK download paths
        /\/(get_apk|apk_url|install)\/|\/(apk|android)\.php/i,
      ];
      break;
    case "all":
      defaultPatterns = [
        /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp|mp3|wav|aac|flac|m4a|jpg|jpeg|png|gif|webp|svg|bmp|tiff|apk|xapk)(\?.*)?$/i,
        /\/video\/|\/videos\/|\/audio\/|\/images\/|\/img\/|\/media\/|\/apk\//i,
        /\/watch\?v=|\/embed\/|player\.php|\/track\//i,
      ];
      break;
    default:
      defaultPatterns = [/\.(mp4|webm|ogg|mov)(\?.*)?$/i];
  }

  const regexPatterns =
    customPatterns.length > 0
      ? customPatterns.map((pattern) => new RegExp(pattern))
      : defaultPatterns;

  return (url) => regexPatterns.some((regex) => regex.test(url));
};

/**
 * Checks if a URL matches any glob pattern
 */
export const matchGlob = (url, patterns) => {
  if (!patterns || patterns.length === 0) return true;

  // Simple glob matching implementation
  return patterns.some((pattern) => {
    const regexPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
};

/**
 * Extracts domain from URL
 */
export const getDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (e) {
    return null;
  }
};
