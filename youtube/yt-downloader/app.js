import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";
import {
  InitializationError,
  ProxyConfigError,
  DataProcessingError,
  InputValidationError,
  SaveFileError,
} from "./shared/error.js";

if (process.env.NODE_ENV == "production") {
  log.setLevel(log.LEVELS.INFO);
  log.debug(`Staring with node env production`);
} else {
  log.setLevel(log.LEVELS.DEBUG);
  log.debug(`Staring with node env development`);
}

async function initializeActor() {
  try {
    const inputValues = await initializeActorAndGetInput();
    log.debug(`Received input: ${JSON.stringify(inputValues, null, 2)}`);

    const {
      audioOnly,
      videoQuality,
      audioQuality,
      videoFormat,
      audioFormat,
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, countryCode },
    } = inputValues;

    if ((!useApifyProxy || !apifyProxyGroups.includes( "RESIDENTIAL")) && process.env.NODE_ENV == "production") {
      throw new ProxyConfigError({
        message: "The actor only works with Apify's 'RESIDENTIAL' proxy.",
        proxyConfig: { useApifyProxy, apifyProxyGroups },
      });
    }

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new InputValidationError({ message: "No valid URLs provided." });
    }

    let proxyUrl = null;
    if(useApifyProxy){
    try {
      proxyUrl = await createProxyConfig(apifyProxyGroups, countryCode);
      log.info(`Using proxy: ${proxyUrl}`);
    } catch (err) {
      throw new ProxyConfigError({ message: "Failed to configure proxy.", 
      error: err });
    }};

    const downloadResults = await downloadYoutubeMusic(
      audioOnly,
      videoQuality,
      audioQuality,
      videoFormat,
      audioFormat,
      urls,
      proxyUrl
    );

    log.debug(`Download results: ${JSON.stringify(downloadResults, null, 2)}`);
    await Actor.setStatusMessage("Download complete. Saving file...");

    const outputData = [];

    for (const item of downloadResults) {
      try {
        log.debug(`Processing item: ${JSON.stringify(item, null, 2)}`);

        const ext = item.ext;
        let contentType = audioOnly ? `audio/${ext}` : `video/${ext}`;

        const savedFile = await saveFileToDB(item.fileTitle, item.filePath, contentType);
        outputData.push(savedFile);

        await Actor.pushData({
          title: savedFile.fileTitle,
          downloadURL: savedFile.downloadUrl,
        });
      } catch (err) {
        throw new SaveFileError({ message: "Failed to save file to DB.", error: err });
      }
    }

    await Actor.setStatusMessage("File saved successfully.");
    log.info(`Final output: ${JSON.stringify(outputData, null, 2)}`);

    await Actor.exit("Download complete");
  } catch (error) {
    log.error(`Error: ${error.name} - ${error.message}`);
    if (error.details) log.error(`Details: ${JSON.stringify(error.details, null, 2)}`);

    await Actor.exit("An error occurred", { timeoutSec: 0 });
  }
}

async function downloadYoutubeMusic(
  audioOnly,
  videoQuality,
  audioQuality,
  videoFormat,
  audioFormat,
  urls,
  proxyUrl
) {
  try {
    log.debug("Preparing to download content...");
    log.debug("Download parameters", {
      audioOnly,
      videoQuality,
      audioQuality,
      videoFormat,
      audioFormat,
      urls,
      proxyUrl,
    });

    const audioQualityToCode = {
      64: 0,
      128: 5,
      256: 9,
      320: 10,
      best: "best",
      worst: "worst"
    };

    const videoQualityToCode = {
      144: "bestvideo[height<=144]+bestaudio/best",
      240: "bestvideo[height<=240]+bestaudio/best",
      360: "bestvideo[height<=360]+bestaudio/best",
      480: "bestvideo[height<=480]+bestaudio/best",
      720: "bestvideo[height<=720]+bestaudio/best",
      1080: "bestvideo[height<=1080]+bestaudio/best",
      best: "bestvideo+bestaudio/best",
      worst: "worst"
    };

    let quality = audioOnly ? audioQualityToCode[audioQuality] : videoQualityToCode[videoQuality];
    log.debug(`quality values after maping: ${quality || undefined}`);

    if (!quality) {
      throw new InputValidationError({
        message: "Invalid quality selection.",
        selectedQuality: { audioOnly, selected: audioQuality || videoQuality },
      });
    };

    const options = [];
    if (audioOnly) options.push("--extract-audio", "--audio-quality", quality);
    if (proxyUrl) options.push("--proxy", proxyUrl);
    
    log.debug(`Format selection values: ${JSON.stringify({
      videoFormat,
      audioFormat,
      audioOnly
    })}`)
    
    if (!audioOnly && videoFormat !== "default") {
      options.push("--merge-output-format", videoFormat);
    } else if (audioOnly && audioFormat !== "default") {
      options.push("--merge-output-format", audioFormat);
    } else {
      log.warning("using default.");
    }

    urls.forEach((item) => {
      if (!item.url) {
        log.warning(`Invalid URL object: ${JSON.stringify(item)}`);
      } else {
        options.push(item.url);
      }
    });

    log.debug(`Final options: ${JSON.stringify(options, null, 2)}`);

    try {
      return await downloadContent(options);
    } catch (err) {
      throw new DataProcessingError({
        message: "Failed to process video download.",
        error: err,
      });
    }
  } catch (error) {
    log.error(`Error in downloading: ${error.name} - ${error.message}`);
    throw error;
  }
}

initializeActor();