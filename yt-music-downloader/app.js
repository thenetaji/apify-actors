import { Actor,log} from "apify";
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
    const requiredFields = ["url", "quality", "proxy", "convertToMp3"];
    const missingFields = requiredFields.filter((field) => !input[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Input validation error: Missing fields: ${missingFields.join(", ")}`;
      log.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { url, quality, proxy, convertToMp3 } = input;
    log.debug("Input validation passed", { url, quality, proxy, convertToMp3 });

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
      convertToMp3,
    );
    log.debug("Download function returned", { title, filePath });

    log.info("Step 6/10: Reading downloaded file...");
    const fileBuffer = fs.readFileSync(filePath);
    const extension = filePath.split(".").pop();
    log.debug("File read successfully", { extension, filePath });

    log.info("Step 7/10: Saving file to store...");
    const keyValueStore = await Actor.openKeyValueStore();
    const key = `${title}.${extension}`;
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
  selectedQuality = "best",
  proxyURL = null,
  convertToMp3 = "default",
) {
  log.debug("Preparing to download music...");
  log.debug("Download parameters", {
    URL,
    selectedQuality,
    proxyURL,
    convertToMp3,
  });

  const qualityToCode = {
    64: 0,
    128: 5,
    256: 9,
    320: 10,
    best: "best",
  };

  const quality = qualityToCode[selectedQuality];
  if (!quality) {
    const errorMessage =
      "Format or quality not matched with the provided values";
    log.error(errorMessage);
    throw new Error(errorMessage);
  }
  log.debug(
    `Selected audio quality: "${selectedQuality}" (mapped to "${quality}")`,
  );

  const options = [
    "--extract-audio",
    "--audio-quality",
    quality,
    "--output",
    "%(title)s.%(ext)s",
    "--restrict-filenames", // Avoid special characters in the filename
    "--proxy",
    proxyURL,
    URL,
  ];

  if (convertToMp3 !== "default") {
    options.push(`--audio-format,
    ${convertToMp3}`);
  }

  const { filePath, title } = await download(options);
  log.debug("Download completed", { filePath, title });

  return { filePath, title };
}

initializeActor();
