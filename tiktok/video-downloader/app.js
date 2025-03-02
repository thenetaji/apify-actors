import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

//log.setLevel(log.LEVELS.DEBUG);

async function initializeActor() {
  try {
    log.info("Initializing actor...");
    const inputValues = await initializeActorAndGetInput();
    log.debug(`Received input: ${JSON.stringify(inputValues, null, 2)}`);

    /**
     * @typedef {object}
     * @property {string} quality - Video quality (e.g. best,and worst)
     * @property {string} format - Video format (e.g., mp4, webm)
     * @property {array} urls - List of URLs to process [{ url: "..." }]
     * @property {object} proxy
     * @property {boolean} proxy.useApifyProxy
     * @property {Array<string>} proxy.apifyProxyGroups - ["RESIDENTIAL"], ["DATACENTER"], etc.
     * @property {string} proxy.apifyProxyCountry - Country for proxy usage
     */
    const {
      quality,
      format,
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, apifyProxyCountry },
      concurrency,
      test,
    } = inputValues;

    if (useApifyProxy == false) {
      log.warn(
        "The actor is configured to work only with 'RESIDENTIAL' proxy. Other proxies may not work correctly.",
      );
    }

    log.info("Creating proxy configuration...");
    const proxyUrl = await createProxyConfig(
      apifyProxyGroups,
      apifyProxyCountry,
    );
    log.info(
      `Using proxy: ${proxyUrl} | Type: ${apifyProxyGroups} | Country: ${apifyProxyCountry}`,
    );

    log.info("Starting video download process...");
    const downloadedContent = await downloadYoutubeVideo(
      urls,
      quality,
      format,
      proxyUrl,
      concurrency,
    );
    log.debug(
      `Downloaded content: ${JSON.stringify(downloadedContent, null, 2)}`,
    );

    await Actor.setStatusMessage("Download complete. Saving files...");

    const outputData = [];

    for (const item of downloadedContent) {
      log.debug(`Processing downloaded item: ${JSON.stringify(item)}`);

      const ext = item.ext;
      const contentType = `video/${ext}`;

      log.info(`Saving file: ${item.fileTitle} (Format: ${ext})`);
      const savedFile = await saveFileToDB(
        item.fileTitle,
        item.filePath,
        contentType,
      );
      log.info(`File saved successfully: ${savedFile.fileTitle}`);

      outputData.push(savedFile);

      await Actor.pushData({
        title: savedFile.fileTitle,
        downloadURL: savedFile.downloadUrl,
      });
    }

    log.info("All files saved successfully.");
    log.info(`Final output data: ${JSON.stringify(outputData, null, 2)}`);

    await Actor.exit("Download complete");
  } catch (error) {
    log.error(`Execution error: ${error.message}`);
    log.debug(`Error details: ${error.stack}`);
    await Actor.exit("An error occurred", { timeoutSec: 0 });
  }
}

async function downloadYoutubeVideo(
  urls,
  selectedQuality = "best",
  format = "default",
  proxyURL = null,
  concurrency = 5,
) {
  log.info(`Preparing to download ${urls.length} video(s)...`);
  log.debug("Download parameters:", {
    urls,
    selectedQuality,
    format,
    proxyURL,
  });

  const options = ["--format", selectedQuality];

  if (proxyURL) {
    log.info(`Using proxy for download: ${proxyURL}`);
    options.push("--proxy", proxyURL);
  }

  if (format !== "default") {
    log.info(`Encoding video in format: ${format}`);
    options.push("--merge-output-format", format);
  }

  if (concurrency) options.push("--concurrent-fragments", concurrency);

  urls.forEach((item) => options.push(item.url));
  log.debug(`Final download options: ${options.join(" ")}`);

  try {
    const result = await downloadContent(options);
    log.info("Download successful.");
    return result;
  } catch (error) {
    log.error(`Download failed: ${error.message}`);
    throw error;
  }
}

initializeActor();
