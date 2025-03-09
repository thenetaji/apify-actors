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
        // Common video file extensions
        /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)(\?.*)?$/i,
        // Common video streaming patterns
        /\/video\/|\/videos\/|\/watch\?v=|\/embed\/|player\.php/i,
        // Various video API endpoints
        /\/(get_video|video_url|playback|stream)\/|\/(video|media)\.php/i,
      ];
      break;
    case "audio":
      defaultPatterns = [
        // Common audio file extensions
        /\.(mp3|wav|ogg|aac|flac|m4a)(\?.*)?$/i,
        // Common audio streaming patterns
        /\/audio\/|\/sound\/|\/listen\/|\/track\//i,
        // Various audio API endpoints
        /\/(get_audio|audio_url|stream)\/|\/(audio|sound)\.php/i,
      ];
      break;
    case "image":
      defaultPatterns = [
        // Common image file extensions
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i,
        // Common image paths
        /\/images\/|\/img\/|\/photos\/|\/gallery\//i,
        // Various image API endpoints
        /\/(get_image|image_url)\/|\/(image|photo)\.php/i,
      ];
      break;
    case "all":
      defaultPatterns = [
        // All media extensions combined
        /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp|mp3|wav|aac|flac|m4a|jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i,
        // Common media paths
        /\/video\/|\/videos\/|\/audio\/|\/images\/|\/img\/|\/media\//i,
        // Common streaming patterns
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
