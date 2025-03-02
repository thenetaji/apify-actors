import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

async function initializeActor() {
  try {
    log.info("Initializing actor...");
    const inputValues = await initializeActorAndGetInput();
    log.debug("Received input values", inputValues);

    const {
      quality,
      format,
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, apifyProxyCountry },
      concurrency,
      test,
    } = inputValues;

    if (useApifyProxy == false) {
      log.error(
        "The actor only works with 'RESIDENTIAL' proxies. Execution halted.",
      );
      await Actor.exit("Invalid proxy configuration", { timeoutSec: 0 });
      return;
    }

    const proxyUrl = await createProxyConfig(apifyProxyGroups, apifyProxyCountry);
    log.info(
      `Using proxy: ${apifyProxyGroups}, country: ${apifyProxyCountry}, URL: ${proxyUrl}`,
    );

    const downloadResults = await downloadYoutubeVideo(
      urls,
      quality,
      format,
      proxyUrl,
      concurrency,
    );

    log.debug("Download results", downloadResults);
    await Actor.setStatusMessage("Download complete. Saving files...");

    const outputData = [];

    for (const item of downloadResults) {
      try {
        const contentType = `video/${item.ext}`;
        log.debug(
          `Saving file: ${item.fileTitle}, Content-Type: ${contentType}`,
        );

        const savedFile = await saveFileToDB(
          item.fileTitle,
          item.filePath,
          contentType,
        );

        outputData.push(savedFile);
        await Actor.pushData({
          title: savedFile.fileTitle,
          downloadURL: savedFile.downloadUrl,
        });
      } catch (saveError) {
        log.error(`Error saving file ${item.fileTitle}: ${saveError.message}`, {
          stack: saveError.stack,
        });
      }
    }

    log.info(`Final output data: ${JSON.stringify(outputData, null, 2)}`);
    await Actor.setStatusMessage("File saving complete.");
    await Actor.exit("Download complete");
  } catch (error) {
    log.error(`Execution error: ${error.message}`, { stack: error.stack });
    await Actor.exit("Execution failed", { timeoutSec: 0 });
  }
}

async function downloadYoutubeVideo(
  urls,
  selectedQuality = "360",
  format = "default",
  proxyURL = null,
  concurrency = 5
) {
  try {
    log.debug("Preparing to download video...");
    log.debug("Download parameters", {
      urls,
      selectedQuality,
      proxyURL,
      format,
    });

    const qualityToCode = {
      144: "bestvideo[height<=144]+bestaudio/bestvideo[height<=144]/best",
      240: "bestvideo[height<=240]+bestaudio/bestvideo[height<=240]/best",
      360: "bestvideo[height<=360]+bestaudio/bestvideo[height<=360]/best",
      480: "bestvideo[height<=480]+bestaudio/bestvideo[height<=480]/best",
      720: "bestvideo[height<=720]+bestaudio/bestvideo[height<=720]/best",
      1080: "bestvideo[height<=1080]+bestaudio/bestvideo[height<=1080]/best",
      best: "bestvideo+bestaudio/best",
    };

    const quality = qualityToCode[selectedQuality];
    if (!quality) throw new Error(`Invalid quality: ${selectedQuality}`);

    log.debug(`Using quality: "${selectedQuality}" -> "${quality}"`);

    const options = ["--format", quality];
    if (proxyURL) options.push("--proxy", proxyURL);
    if (format !== "default") options.push("--merge-output-format", format);
    if(concurrency) options.push("--concurrent-fragments", concurrency);

    urls.map((item) => options.push(item.url));
    log.debug("Final yt-dlp options", options);

    return await downloadContent(options);
  } catch (error) {
    log.error(`Error in downloadYoutubeVideo: ${error.message}`, {
      stack: error.stack,
    });
    throw error;
  }
}

initializeActor();
