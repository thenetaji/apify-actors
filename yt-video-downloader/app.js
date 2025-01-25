import { Actor } from "apify";
import { logger as log } from "./shared/logger.js";
import download from "./shared/download.js";
import fs from "fs";

export async function initializeActor() {
  try {
    log.info("Step 1/10: Initializing Actor...");
    await Actor.init();

    log.info("Step 2/10: Retrieving input...");
    const input = await Actor.getInput();
    log.debug("Input retrieved:", input);

    log.info("Step 3/10: Validating input...");
    const requiredFields = ["url", "quality", "proxy"];
    const missingFields = requiredFields.filter((field) => !input[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Input validation error: Missing fields: ${missingFields.join(", ")}`;
      log.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { url, quality, proxy, format } = input;
    log.debug("Input validation passed", { url, quality, proxy, format });

    log.info("Step 4/10: Configuring proxy...");
    const proxyConfig = await Actor.createProxyConfiguration({
      groups: ["RESIDENTIAL"],
    });
    const proxyURL = await proxyConfig.newUrl();
    log.info("Using residential proxy URL", { proxyURL });

    log.info("Step 5/10: Starting download process...");
    const { title, filePath } = await downloadYoutubeMusic(
      url,
      quality,
      proxyURL,
      format,
    );
    log.debug("Download function returned", { title, filePath });

    const extension = filePath.split(".").pop();
    const key = `${title.split(".")[0]}.${extension}`;
    log.debug(`Extension: ${extension}, Key: ${key}`);

    log.info("Step 6/10: Reading downloaded file...");
    //using key as filepath beacuse filePath contains some chars which later gets removed by ytdlp as post-process eg:- "Stunning_Sunset_Seen_From_The_Sea_Time_lapse_10_Seconds_Video_Nature_Blogs.f251.webm"

    const fileBuffer = fs.readFileSync(key);
    log.debug("File read successfully", { key });

    log.info("Step 7/10: Saving file to store...");
    const keyValueStore = await Actor.openKeyValueStore();
    await keyValueStore.setValue(key, fileBuffer, {
      contentType: `audio/${extension}`,
    });

    const publicUrl = `https://api.apify.com/v2/key-value-stores/${keyValueStore.id}/records/${encodeURIComponent(key)}`;
    log.info("File saved to key-value store", { publicUrl });

    log.info("Step 8/10: Pushing data to dataset...");
    const outputData = {
      publicUrl,
      title,
      fileName: `${title}.${extension}`,
      timestamp: new Date().toISOString(),
    };
    await Actor.pushData(outputData);
    log.debug("Data pushed to dataset", outputData);

    log.info("Step 9/10: Saving output data...");
    await Actor.setValue("OUTPUT", outputData);

    log.info("Step 10/10: Updating status...");
    await Actor.setStatusMessage(` Download URL: ${publicUrl}`);
    await Actor.exit();
  } catch (error) {
    log.error(`An error occurred during execution: ${error}`);
    await Actor.exit(error, { status: 1 });
  }
}

export async function downloadYoutubeMusic(
  URL,
  selectedQuality = "360",
  proxyURL = null,
  format = "default",
) {
  log.debug("Preparing to download music...");
  log.debug("Download parameters", { URL, selectedQuality, proxyURL, format });

  const qualityToCode = {
    144: "bestvideo[height<=144]+bestaudio/best",
    240: "bestvideo[height<=240]+bestaudio/best",
    360: "bestvideo[height<=360]+bestaudio/best",
    480: "bestvideo[height<=480]+bestaudio/best",
    720: "bestvideo[height<=720]+bestaudio/best",
    1080: "bestvideo[height<=1080]+bestaudio/best",
    1440: "bestvideo[height<=1440]+bestaudio/best",
    2160: "bestvideo[height<=2160]+bestaudio/best",
    4320: "bestvideo[height<=4320]+bestaudio/best",
    best: "bestvideo+bestaudio",
  };

  const quality = qualityToCode[selectedQuality];
  if (!quality) {
    const errorMessage = "Quality not matched with the provided values";
    log.error(errorMessage);
    throw new Error(errorMessage);
  }

  log.debug(`Selected quality: "${selectedQuality}" (mapped to "${quality}")`);

  const options = [
    "--format",
    quality,
    "--output",
    "%(title)s.%(ext)s",
    "--restrict-filenames", // Avoid special characters in filenames
  ];

  if (proxyURL != null) {
    options.push("--proxy", proxyURL);
  }
  if (format !== "default") {
    options.push("--merge-output-format", format);
  }
  options.push(URL);

  log.debug("Final yt-dlp options:", options);

  const { filePath, title } = await download(options);
  log.debug("Download completed", { filePath, title });

  return { filePath, title };
}

initializeActor();
