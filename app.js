import { Actor } from "apify";
import { spawn } from "child_process";
import fs from "fs";

await Actor.init();

const input = await Actor.getInput();
const { url, useProxy, proxyConfiguration, convertToMp3 } = input;

if (!url) {
  throw new Error("The URL parameter is required.");
}

let proxyUrl = null;
if (useProxy) {
  const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);
  proxyUrl = await proxyConfig.newUrl();
  console.log(`Using proxy: ${proxyUrl}`);
}

try {
  // Update status: Starting the download
  await Actor.setStatusMessage("Starting the download process...");
  console.log("Downloading content...");

  const { title, filePath } = await downloadContent(url, proxyUrl, convertToMp3);

  // Update status: File downloaded, storing in key-value store
  await Actor.setStatusMessage("Download complete. Storing the file...");
  console.log("Download complete. File path:", filePath);

  const keyValueStore = await Actor.openKeyValueStore();
  const fileBuffer = fs.readFileSync(filePath);
  const extension = convertToMp3 ? "mp3" : filePath.split(".").pop();
  const key = `${title}.${extension}`;

  await keyValueStore.setValue(key, fileBuffer, { contentType: `audio/${extension}` });

  const publicUrl = `https://api.apify.com/v2/key-value-stores/${keyValueStore.id}/records/${encodeURIComponent(key)}`;

  // Push data to the dataset
  const outputData = {
    publicUrl,
    title,
    fileName: `${title}.${extension}`,
    timestamp: new Date().toISOString(),
  };

  await Actor.pushData(outputData); // Store structured data in the dataset
  console.log("Data successfully pushed to the dataset:", outputData);

  // Update OUTPUT and status
  await Actor.setValue("OUTPUT", outputData);
  await Actor.setStatusMessage(`Task completed successfully. OUTPUT: ${outputData}`);
} catch (error) {
  console.error(`Error during download or storage: ${error.message}`);

  // Push error data to the dataset
  const errorData = {
    error: error.message,
    timestamp: new Date().toISOString(),
  };
  await Actor.pushData(errorData);
  console.log("Error details pushed to the dataset:", errorData);

  // Update OUTPUT with error details
  await Actor.setValue("OUTPUT", errorData);
  await Actor.setStatusMessage(`Error occurred: ${error.message}`);
}

await Actor.exit();

async function downloadContent(url, proxyUrl = null, convertToMp3 = true) {
  const options = ["--format", "bestaudio", "--output", "%(title)s.%(ext)s", "--restrict-filename", url];

  if (convertToMp3) {
    options.push("--extract-audio", "--audio-format", "mp3");
  }

  if (proxyUrl) {
    options.push("--proxy", proxyUrl);
  }

  const shell = spawn("yt-dlp", options);

  let title = "";
  let filePath = "";
  let errorOutput = "";

  return new Promise((resolve, reject) => {
    shell.stdout.on("data", (data) => {
      const str = data.toString();
      if (str.includes("Destination: ")) {
        filePath = str.split("Destination: ")[1].trim();
        title = filePath.replace(/\.[a-zA-Z0-9]+$/, ""); // Remove file extension
        console.log("Downloaded:", filePath);
      }
    });

    shell.stderr.on("data", (error) => {
      errorOutput += error.toString();
    });

    shell.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Process process failed with code ${code}: ${errorOutput}`),
        );
      } else {
        resolve({ title, filePath });
      }
    });

    shell.on("error", (error) => {
      reject(new Error(`Failed to start process: ${error.message}`));
    });
  });
}