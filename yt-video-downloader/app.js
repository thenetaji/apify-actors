import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

async function initializeActor() {
  try {
    const inputValues = await initializeActorAndGetInput();

    /**
     * @typedef {object}
     * @property {string} quality - video quality eg. 360, 240 etc
     * @property {string} format - whether to encode video into different format eg. mp4, webm, mkv
     * @property {array} urls - [{url: "somerandomurls"}, {url: "samesamebutdifferent"}]
     * @property {object} proxy
     * @property {Boolean} proxy.useApifyProxy
     * @property {Array<string>} proxy.proxyGroup - ["RESIDENTIAL"] or ["DATACENTRE"] etc.
     * @property {string} countryCode - proxy country to use
     */
    const {
      quality,
      format,
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, countryCode },
    } = inputValues;

    if (!useApifyProxy && apifyProxyGroups != "RESIDENTIAL") {
      log.error(
        "The actor would not work with any other proxy except 'RESIDENTIAL'",
      );
    }

    const proxyUrl = await createProxyConfig(apifyProxyGroups, countryCode);
    log.info(`Using proxy type: ${apifyProxyGroups} with country: ${countryCode} and url: ${proxyUrl}`);

    const downloadContent = await downloadYoutubeVideo(
      urls,
      quality,
      format,
      proxyUrl,
    );
    log.debug(
      `downloadContent function returned: ${JSON.stringify(downloadContent)}`,
    );
    await Actor.setStatusMessage("Download complete. Saving file...");

    const outputData = [];

    for (const item of downloadContent) {
      const ext = item.ext;
      const contentType = `video/${ext}`;

      log.debug(`item of downloadContent: ${JSON.stringify(item)}`);

      const saveFile = await saveFileToDB(
        item.fileTitle,
        item.filePath,
        contentType,
      );

      outputData.push(saveFile);
      await Actor.pushData({
        title: saveFile.fileTitle,
        downloadURL: saveFile.downloadUrl,
      });
    }
    await Actor.setStatusMessage("File saved successfully...");
    log.debug(outputData);

    log.info(`Download Values: ${JSON.stringify(outputData, null, 2)}`);

    await Actor.exit("Download complete");
  } catch (error) {
    log.error(`An error occurred during execution: ${error.message}`);
    await Actor.exit("An error occured", { timeoutSec: 0 });
  }
}

async function downloadYoutubeVideo(
  urls,
  selectedQuality = "360",
  format = "default",
  proxyURL = null,
) {
  log.debug("Preparing to download video...");
  log.debug("Download parameters", { urls, selectedQuality, proxyURL, format });

  const qualityToCode = {
    144: "bestvideo[height<=144]+bestaudio/best",
    240: "bestvideo[height<=240]+bestaudio/best",
    360: "bestvideo[height<=360]+bestaudio/best",
    480: "bestvideo[height<=480]+bestaudio/best",
    720: "bestvideo[height<=720]+bestaudio/best",
    1080: "bestvideo[height<=1080]+bestaudio/best",
    best: "bestvideo+bestaudio",
  };

  const quality = qualityToCode[selectedQuality];
  if (!quality) throw new Error("Invalid quality");

  log.debug(`Selected quality: "${selectedQuality}" -> "${quality}"`);

  const options = ["--format", quality];

  if (proxyURL) options.push("--proxy", proxyURL);

  if (format !== "default") options.push("--merge-output-format", format);

  urls.map((item) => options.push(item.url));

  log.debug("Final options:", options);

  return downloadContent(options);
}

initializeActor();
