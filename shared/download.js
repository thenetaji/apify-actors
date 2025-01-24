import { spawn } from "child_process";
import { logger as log } from "./logger.js";

async function download(options) {
	log.debug("starting with options",{ options });
  const shell = spawn("yt-dlp", options);

  let stderr = "";
  let title = "";
  let filePath = "";

  return new Promise((resolve, reject) => {
    shell.stdout.on("data", (data) => {
      const str = data.toString();
      log.debug(`Stdout received: ${str}`);

      // Example string: "[download] Destination: Rick_Astley_-_Never_Gonna_Give_You_Up_Official_Music_Video.webm"
      if (str.includes("Destination: ")) {
        const splitArray = str.split("Destination: ");
        if (splitArray.length > 1) {
          filePath = splitArray.pop().trim();
          title = filePath.replace(/\.[a-zA-Z0-9]+$/, ""); // Remove file extension

          log.debug(`Extracted filePath: ${filePath}`);
          log.debug(`Extracted title: ${title}`);
        }
      }
    });

    // Handle stderr data
    shell.stderr.on("data", (data) => {
      stderr += data.toString();
      log.error(`Stderr received: ${stderr}`);
    });

    // Handle process error
    shell.on("error", (err) => {
      log.error("Failed to start yt-dlp process", err);
      reject(new Error("Failed to start yt-dlp process. Please try again."));
    });

    // Handle process close event
    shell.on("close", (code) => {
      if (code === 0) {
        log.debug("yt-dlp process exited successfully.");
        resolve({ title, filePath });
      } else {
        log.error(`yt-dlp process failed with code ${code}. Error: ${stderr}`);
        reject(new Error(`yt-dlp process failed with code ${code}.`));
      }
    });
  });
}

export default download;