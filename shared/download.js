import { spawn } from "child_process";
import log from "@apify/log";
import UserAgent from "user-agents";
import path from "path";

/**
 * Attempts to download the content using yt-dlp.
 * @param {Array} options - The array of URLs to download.
 * @returns {Promise<Array>} - Resolves with an array of downloaded files.
 */
async function tryDownload(options) {
  log.debug(`Starting yt-dlp download`);

  const agent = new UserAgent().toString();
  const configs = [
    "--user-agent",
    agent,
    "--no-warning",
    "--no-check-certificate",
    "--output",
    "%(title)s.%(ext)s",
    "--restrict-filenames",
    "--exec",
    "echo FINAL_FILE:{}",
    ...options,
  ];

  return new Promise((resolve, reject) => {
    const shell = spawn("yt-dlp", configs);
    let stderr = "";
    const downloadData = [];

    shell.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output.trim() == "") {
        log.info("-----------------------");
        return;
      }
      log.info(`Stdout received: ${output}`);

      output.split("\n").forEach((line) => {
        if (line.startsWith("FINAL_FILE:")) {
          const filePathString = line.replace("FINAL_FILE:", "").trim();

          // Extract filename and extension
          const fileName = path
            .basename(filePathString)
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/\s*-\s*/g, " - ") // Ensure proper spacing around hyphens
            .replace(/\s+/g, " ") // Remove extra spaces
            .trim() // Trim leading and trailing spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
            .replace(/[^a-zA-Z0-9!_.()'-]/g, "_") // Replace disallowed characters with "_"
            .slice(0, 256); // Ensure max length
          const ext = path.extname(fileName);
          const fileTitle = fileName.replace(ext, ""); // Remove extension

          log.debug(
            `Data being pushed to download array: fileTitle: ${fileTitle}, ext: ${ext}, filePath: ${filePathString}`,
          );
          downloadData.push({ fileTitle, ext, filePath: filePathString });

          log.debug(`Download array: ${JSON.stringify(downloadData)}`);
        }
      });
    });

    shell.stderr.on("data", (data) => {
      stderr += data.toString();
      log.error(`Stderr received: ${stderr}`);
    });

    shell.on("error", (err) => {
      log.error("Failed to start yt-dlp process", err);
      reject(new Error("Failed to start process. Please try again."));
    });

    shell.on("close", (code) => {
      if (code === 0) {
        log.debug("yt-dlp process exited successfully.");
        log.debug(
          `Download array passed to resolve: ${JSON.stringify(downloadData)}`,
        );
        resolve(downloadData);
      } else {
        log.error(`yt-dlp process failed with code ${code}. Error: ${stderr}`);
        reject(new Error(`Process failed with code ${code}.`));
      }
    });
  });
}

/**
 * Attempts to download a list of URLs.
 * @param {Array} options - The array of URLs to download.
 * @returns {Promise<Array>} - Resolves with an array of downloaded files.
 * @throws {Error} - If extraction fails.
 */
async function downloadContent(options) {
  log.debug(
    `Data passed to downloadContent function: ${JSON.stringify(options)}`,
  );

  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("No URLs provided for download.");
  }

  log.debug("Starting download:", options);

  try {
    return await tryDownload(options);
  } catch (err) {
    log.error("Download failed", err);
    throw new Error("Download failed.");
  }
}

/**
 * Extracts the direct download URL.
 * @param {Array} options - The yt-dlp options.
 * @returns {Promise<Array>} - Resolves with an array of objects containing title and URL.
 */
export async function getDirectUrl(options) {
  return new Promise((resolve, reject) => {
    const shell = spawn("yt-dlp", options);
    let stderr = "";
    const downloadData = [];

    shell.stdout.on("data", (data) => {
      const output = data.toString().trim();
      log.info(`Stdout received: ${output}`);

      let title = "";
      output.split("\n").forEach((item) => {
        if (item.startsWith("http")) {
          downloadData.push({
            title: title.trim(),
            downloadUrl: item.trim(),
          });
          title = "";
        } else {
          title = item;
        }
      });
    });

    shell.stderr.on("data", (data) => {
      stderr += data.toString();
      log.error(`Stderr received: ${stderr}`);
    });

    shell.on("error", (err) => {
      log.error("Failed to start yt-dlp process", err);
      reject(new Error("Failed to start process. Please try again."));
    });

    shell.on("close", (code) => {
      if (code === 0) {
        log.debug("yt-dlp process exited successfully.");
        resolve(downloadData);
      } else {
        log.error(`yt-dlp process failed with code ${code}. Error: ${stderr}`);
        reject(new Error(`Process failed with code ${code}.`));
      }
    });
  });
}

export default downloadContent;
