import { Actor, log } from "apify";
import fs from "fs";
import { spawn } from "child_process";

//uncomment in debugging
//log.setLevel(log.LEVELS.DEBUG);

export async function initializeActor() {
  try {
    log.info("Step 1/10: Initializing Actor...");
    await Actor.init();

    log.info("Step 2/10: Retrieving input...");
    const input = await Actor.getInput();
    log.debug("Input retrieved:", input);

    log.info("Step 3/10: Validating input...");
    const requiredFields = ["url", "proxy"];
    const missingFields = requiredFields.filter((field) => !input[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Input validation error: Missing fields: ${missingFields.join(", ")}`;
      log.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { url, proxy } = input;
    log.debug("Input validation passed");

    log.info("Step 4/10: Configuring proxy...");
    const proxyConfig = await Actor.createProxyConfiguration({
      groups: ["RESIDENTIAL"],
    });
    const proxyURL = await proxyConfig.newUrl();
    log.info("Using residential proxy URL", { proxyURL });

    log.info("Step 5/10: Starting scraping process...");
    const metaArray = await getYoutubeMetadata(url, proxyURL);
    log.debug("Meta function returned", metaArray);

    log.info("Step 6/10: Saving data to dataset...");
    for (const meta of metaArray) {
      await Actor.pushData(meta);
    }
    log.info("All data pushed to dataset.");

    await Actor.exit({ timeoutSecs: 0 });
  } catch (error) {
    log.error(`An error occurred during execution: ${error}`);
    await Actor.exit(error, { status: 1 });
  }
}

/**
 * extracts youtube videos details
 * @param {array} URLs - Array of URLs or URL
 * @param {string} proxyURL
 */
export async function getYoutubeMetadata(URLs, proxyURL = null) {
  try {
    log.info("Preparing to scrape...");
    log.debug("Scraping parameters", {
      URLs,
      proxyURL,
    });

    const results = [];

    for (const { url } of URLs) {
      const meta = await new Promise((resolve, reject) => {
        const options = [
          "--quiet",
          "--no-warnings",
          "--skip-download",
          "--dump-json",
          "--proxy",
          proxyURL,
          url,
        ];

        log.debug(`Starting yt-dlp for ${url} with options`, { options });
        const shell = spawn("yt-dlp", options);

        let stderr = "";
        let stdout = "";

        shell.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        // Collect all data before processing
        shell.stdout.on("close", () => {
          try {
            const meta = filterData(JSON.parse(stdout)); // Converts to JS object as it's a JSON string
            log.debug(`Meta data received for ${url}:`, meta);
            log.info("Data filtered");
            resolve(meta);
          } catch (error) {
            log.error(`Error parsing JSON output for ${url}: ${error.message}`);
            reject(error);
          }
        });

        // Handle stderr data
        shell.stderr.on("data", (data) => {
          stderr += data.toString();
          log.error(`Stderr received for ${url}: ${stderr}`);
        });

        // Handle process error
        shell.on("error", (err) => {
          log.error(`Failed to start yt-dlp for ${url}`, err);
          reject(new Error(`Failed to start yt-dlp for ${url}`));
        });

        // Handle process close event
        shell.on("close", (code) => {
          if (code !== 0) {
            log.error(
              `yt-dlp failed for ${url} with code ${code}. Error: ${stderr}`,
            );
            reject(new Error(`yt-dlp failed for ${url}`));
          }
        });
      });

      results.push(meta);
    }

    return results;
  } catch (err) {
    log.error("An error occured", err);
  }
}

export function filterData(meta) {
  const info = {
    id: meta.id,
    title: meta.title,
    description: meta.description,
    comments: meta.comment_count,
    duration: meta.duration,
    views: meta.view_count,
    likes: meta.like_count,
    average_rating: meta.average_rating,
    age_limit: meta.age_limit,
    upload_date: meta.upload_date,

    channel: {
      id: meta.channel_id,
      name: meta.channel,
      url: meta.channel_url,
      follower_count: meta.channel_follower_count,
      is_verified: meta.channel_is_verified,
    },
  };

  const thumbnails = meta.thumbnails
    .filter((item) => item.resolution)
    .map((item) => ({
      url: item.url,
      width: item.width,
      height: item.height,
    }));
  return { info, thumbnails };
}

initializeActor();
