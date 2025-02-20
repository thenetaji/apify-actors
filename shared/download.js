import { spawn } from "child_process";
import log from "@apify/log";
import UserAgent from "user-agents";
import path from "path";

/**
 * Attempts to download the content using yt-dlp with the specified player client.
 * @param {Array} options - The array of URLs to download.
 * @param {string} client - The YouTube player client to use (e.g., web, ios, tvhtml5).
 * @returns {Promise<Array>} - Resolves with an array of downloaded files.
 */
async function tryDownload(options, client) {
  log.debug(`Trying download with client: ${client}`);

  const agent = new UserAgent().toString();
  const configs = [
    "--user-agent",
    agent,
    "--no-warning",
    "--no-check-certificate",
    "--extractor-args",
    `youtube:player_client=${client}`, // Dynamic client selection
    "--concurrent-fragments",
    5,
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
      log.info(`Stdout received: ${output}`);

      output.split("\n").forEach((line) => {
        if (line.startsWith("FINAL_FILE:")) {
          const filePathString = line.replace("FINAL_FILE:", "").trim();

          // Extract filename and extension
          const fileName = path    .basename(filePathString)
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\s*-\s*/g, " - ") // Ensure proper spacing around hyphens
    .replace(/\s+/g, " ") // Remove extra spaces
    .trim() // Trim leading and trailing spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
    .replace(/[^a-zA-Z0-9!_.()'-]/g, "_") // Replace disallowed characters with "_"
    .slice(0, 256); // Ensure max length
          const ext = path.extname(fileName);
          const fileTitle = fileName.replace(ext, ""); // Remove extension
          
          log.debug(`Data being pushed to download array: fileTitle: ${fileTitle}, ext: ${ext}, filePath: ${filePathString}`);
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
        log.debug(`Download array passed to resolve: ${JSON.stringify(downloadData)}`);
        resolve(downloadData);
      } else {
        log.error(`yt-dlp process failed with code ${code}. Error: ${stderr}`);
        reject(new Error(`Process failed with code ${code}.`));
      }
    });
  });
}

/**
 * Attempts to download a list of URLs using different player clients as fallback options.
 * @param {Array} options - The array of URLs to download.
 * @returns {Promise<Array>} - Resolves with an array of downloaded files.
 * @throws {Error} - If all extraction methods fail.
 *
 * Example return value:
 * [
 *   {
 *     title: "Bad_news_for_Mukesh_Ambani_as_Delhi_HC_quashes_award_in_KG_basin_gas_dispute_worth_1.7_billion",
 *     ext: ".webm",
 *     filePath: "/data/data/com.termux/files/home/apify-actors/shared/Bad_news_for_Mukesh_Ambani_as_Delhi_HC_quashes_award_in_KG_basin_gas_dispute_worth_1.7_billion.webm"
 *   },
 *   {
 *     title: "kattar_hindu_status_bajrang_dal_shorts_bajrangdal_kattarhindu_hindutva",
 *     ext: ".webm",
 *     filePath: "/data/data/com.termux/files/home/apify-actors/shared/kattar_hindu_status_bajrang_dal_shorts_bajrangdal_kattarhindu_hindutva.webm"
 *   }
 * ]
 */
async function downloadContent(options) {
  log.debug(`Data passed to downloadContent function: ${JSON.stringify(options)}`);
  
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("No URLs provided for download.");
  }

  log.debug("Starting download:", options);

  // List of player clients to try, in order of preference
  const clients = ["web", "ios", "tvhtml5"];

  for (const client of clients) {
    try {
      log.debug(`Trying with player client: ${client}`);
      const result = await tryDownload(options, client);
      if (result.length > 0) return result; // Return on first success
    } catch (err) {
      log.warning(`Failed with client ${client}, trying next...`);
    }
  }

  throw new Error("All extraction methods failed.");
}

export default downloadContent;