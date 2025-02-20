import { Actor, log } from "apify";
import downloadContent from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

log.setLevel(log.LEVELS.DEBUG);

async function initializeActor() {
  try {
    const inputValues = await initializeActorAndGetInput();

    /**
     * @typedef {object}
     * @property {string} quality - audio quality eg. 360, 240 etc
     * @property {string} format - whether to encode audio into different format eg. mp4, webm, mkv
     * @property {array} urls - [{url: "somerandomurls"}, {url: "samesamebutdifferent"}]
     * @property {object} proxy
     * @property {Boolean} proxy.useApifyProxy
     * @property {Array<string>} proxy.proxyGroup - ["RESIDENTIAL"] or ["DATACENTRE"] etc.
     * @property {string} countryCode - proxy country to use
     */
    const {
      quality,
      format, //convert to another format eg. mp3, ogg
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, countryCode },
    } = inputValues;

    if (!useApifyProxy && apifyProxyGroups != "RESIDENTIAL") {
      throw new Error(
        "The actor would not work with any other proxy except 'RESIDENTIAL'",
      );
    }

    const proxyUrl = await createProxyConfig(apifyProxyGroups, countryCode);

    const downloadContent = await downloadYoutubeMusic(
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
      const contentType = `audio/${ext}`;

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

async function downloadYoutubeMusic(
  urls,
  selectedQuality = "best",
  format = "default",
  proxyURL = null,
) {
  log.debug("Preparing to download video...");
  log.debug("Download parameters", { urls, selectedQuality, proxyURL, format });

  const qualityToCode = {
    64: 0,
    128: 5,
    256: 9,
    320: 10,
    best: "best",
  };

  const quality = qualityToCode[selectedQuality];
  if (!quality) throw new Error("Invalid quality");

  log.debug(`Selected quality: "${selectedQuality}" -> "${quality}"`);

  const options = ["--extract-audio", "--audio-quality", quality];

  if (proxyURL) options.push("--proxy", proxyURL);

  if (format !== "default") options.push("--audio-format", format);

  urls.map((item) => options.push(item.url));

  log.debug("Final options:", options);

  return downloadContent(options);
}

initializeActor();
