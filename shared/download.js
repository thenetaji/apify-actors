import { spawn } from "child_process";
import log from "@apify/log";
import UserAgent from "user-agents";
import path from "path";

async function downloadContent(options) {
  log.debug(`Data passed to downloadContent function: ${JSON.stringify(options)}`);
  
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("No URLs provided for download.");
  }

  log.debug("Starting download:", options);

  const agent = new UserAgent().toString();

  const configs = [
    "--user-agent",
    agent,
    "--no-warning",
    "--concurrent-fragments",
    5,
    "--output",
    "%(title)s.%(ext)s",
    "--restrict-filenames",
    "--exec",
    "echo FINAL_FILE:{}",
    ...options,
  ];

  const shell = spawn("yt-dlp", configs);

  let stderr = "";
  const downloadData = [];

  return new Promise((resolve, reject) => {
    shell.stdout.on("data", (data) => {
      const output = data.toString().trim();
      log.info(`Stdout received: ${output}`);

      output.split("\n").forEach((line) => {
        if (line.startsWith("FINAL_FILE:")) {
          const filePathString = line.replace("FINAL_FILE:", "").trim();

          // Extract filename and extension
          const fileName = path.basename(filePathString);
          const ext = path.extname(fileName);
          const fileTitle = fileName.replace(ext, ""); // Remove extension
          
          log.debug(`data being pushed to download array in downloadContent function: fileTitle: ${fileTitle} & ext: ${ext} & filePath: ${filePathString}`);
          downloadData.push({ fileTitle, ext, filePath: filePathString });

          log.debug(
            `Download array: ${JSON.stringify(downloadData)}`
          );
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
        log.debug(`download array being passed to resolve downloadContent function: ${JSON.stringify(downloadData)}`);
        resolve(downloadData);
      } else {
        log.error(`yt-dlp process failed with code ${code}. Error: ${stderr}`);
        reject(new Error(`process failed with code ${code}.`));
      }
    });
  });
}

/**
 * return example
 * 
 * [
  {
    title: "Bad_news_for_Mukesh_Ambani_as_Delhi_HC_quashes_award_in_KG_basin_gas_dispute_worth_1.7_billion",
    ext: ".webm",
    filePath: "/data/data/com.termux/files/home/apify-actors/shared/Bad_news_for_Mukesh_Ambani_as_Delhi_HC_quashes_award_in_KG_basin_gas_dispute_worth_1.7_billion.webm"
  },
  {
    title: "kattar_hindu_status_bajrang_dal_shorts_bajrangdal_kattarhindu_hindutva",
    ext: ".webm",
    filePath: "/data/data/com.termux/files/home/apify-actors/shared/kattar_hindu_status_bajrang_dal_shorts_bajrangdal_kattarhindu_hindutva.webm"
  }
]
 */

export default downloadContent;
