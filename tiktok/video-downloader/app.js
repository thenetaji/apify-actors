import { Actor, log } from "apify";
import { getDirectUrl } from "./shared/download.js";
import {
  initializeActorAndGetInput,
  createProxyConfig,
  saveFileToDB,
} from "./shared/utils.js";

//log.setLevel(log.LEVELS.DEBUG);

async function initializeActor() {
  try {
    const inputValues = await initializeActorAndGetInput();

    /**
     * @typedef {object}
     * @property {array} urls - [{url: "somerandomurls"}, {url: "samesamebutdifferent"}]
     * @property {object} proxy
     * @property {Boolean} proxy.useApifyProxy
     * @property {Array<string>} proxy.proxyGroup - ["RESIDENTIAL"] or ["DATACENTRE"] etc.
     * @property {string} countryCode - proxy country to use
     */
    log.debug(`input received: ${inputValues}`);
    const {
      urls,
      proxy: { useApifyProxy, apifyProxyGroups, countryCode },
    } = inputValues;

    let proxyUrl;
    if (useApifyProxy) {
      proxyUrl = await createProxyConfig(apifyProxyGroups, countryCode);
      log.info(
        `Using proxy type: ${apifyProxyGroups} with country: ${countryCode} and url: ${proxyUrl}`,
      );
    }

    const downloadContent = await getDirectVideoURL(urls, proxyUrl);
    log.debug(
      `downloadContent function returned: ${JSON.stringify(downloadContent)}`,
    );
    await Actor.setStatusMessage("Download complete. Saving file...");

    for (const item of downloadContent) {
      log.debug(`item of downloadContent: ${JSON.stringify(item)}`);

      await Actor.pushData({
        title: item.fileTitle,
        downloadURL: item.downloadUrl,
      });
    }
    await Actor.setStatusMessage("File saved successfully...");
    
    log.info(`DOWNLOAD URLS: ${JSON.stringify(downloadContent, null, 2)}`);

    await Actor.exit("Download complete");
  } catch (error) {
    log.error(`An error occurred during execution: ${error.message}`);
    await Actor.exit("An error occured", { timeoutSec: 0 });
  }
}

async function getDirectVideoURL(urls, proxyURL = null) {
  log.debug("Preparing to download video...");
  log.debug("Download parameters", { urls, proxyURL });

  const options = [
    "-g", 
    "--get-title",
    "--skip-download",
    "--no-check-certificate"
    ];

  if (proxyURL) options.push("--proxy", proxyURL);

  urls.map((item) => options.push(item.url));

  log.debug("Final options:", options);

  return getDirectUrl(options);
}

initializeActor();
