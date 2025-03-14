import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

if (process.env.NODE_ENV == "production") {
  log.setLevel(log.LEVELS.INFO);
} else {
  log.setLevel(log.LEVELS.DEBUG);
}

async function initializeActor() {
  try {
    log.info("Initializing actor...");
    const inputValues = await initializeActorAndGetInput();
    log.info(`Received input: ${JSON.stringify(inputValues, null, 2)}`);

    const {
      quality,
      format,
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, apifyProxyCountry },
      concurrency,
      test,
    } = inputValues;

    if (useApifyProxy == false) {
      log.warning("Use proxy if the download fails");
    }

    let proxyUrl;
    if (useApifyProxy) {
      log.info("Creating proxy configuration...");
      proxyUrl = await createProxyConfig(apifyProxyGroups, apifyProxyCountry);
      log.info(
        `Using proxy: ${proxyUrl} | Type: ${apifyProxyGroups} | Country: ${apifyProxyCountry}`,
      );
    }

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
    await Actor.fail("An error occurred", { timeoutSec: 0 });
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

  const options = [
    "--format",
    selectedQuality,
    "--fragment-retries",
    3,
    "--retries",
    2,
  ];

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
