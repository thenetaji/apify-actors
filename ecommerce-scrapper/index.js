import { Actor, log } from "apify";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";
import axios from "axios";
import {
  ValidationError,
  NetworkError,
  ScraperError,
  DataExtractionError,
} from "./error.js";

log.setLevel(log.LEVELS.DEBUG);

/**
 * Extracts and returns product data from ecommerce sites
 * @class Scraper
 */
class Scraper {
  /**
   * Receives urls array and cc of a site and returns the html code for each URL
   * @param {object} params
   * @param {Array} params.urls - Array of URLs
   * @param {string} params.cc - Country code. Used in the proxy to fetch the site from that specific country
   */
  constructor(urls, cc = null, proxyUrl = null) {
    this.urls = urls;
    this.proxyUrl = proxyUrl;
    this.cc = cc;
    log.info(`Scraper initialized with URLs: ${urls} and Country Code: ${cc}`);
  }

  async flipkart() {
    const results = [];

    // Iterate over each URL and fetch data
    for (const { url } of this.urls) {
      const response = await fetch(url);
      const data = await response.text();
      const $ = cheerio.load(data);

      const getTitle = () => {
        let title = $("title").text().split(" -")[0].trim();
        title = title || $("._1IDfE3").first().text().trim();

        if (!title) {
          throw new DataExtractionError("Title not found");
        }

        return title;
      };

      const getPricings = () => {
        let currentPrice = $("div:contains('₹')")
          .first()
          .text()
          .match(/₹[\d,]+/);
        currentPrice = currentPrice ? currentPrice[0] : null;

        if (!currentPrice) {
          currentPrice = $("._30jeq3._16Jk6d").text().replace(/,/g, "");
          currentPrice = currentPrice ? `₹${currentPrice}` : null;
        }

        log.debug(`Div selection returned: Current price ${currentPrice}`);

        return currentPrice;
      };

      try {
        const title = await getTitle();
        const pricings = await getPricings();

        results.push({ url, title, pricings });
      } catch (err) {
        log.error(`Error processing URL ${url}: ${err.message}`);
      }
    }

    return results;
  }
}

async function initializeActor() {
  try {
    await Actor.init();

    const input = await Actor.getInput();
    log.debug("Input retrieved:", input);

    const requiredFields = ["urls", "proxy", "country"];
    const missingFields = requiredFields.filter((field) => !input[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Input validation error: Missing fields: ${missingFields.join(", ")}`;
      log.error(errorMessage);
      throw new ValidationError(errorMessage);
    }

    const { urls, proxy, country } = input;
    log.debug("Input validation passed", { urls, proxy, country });

    const proxyConfig = await Actor.createProxyConfiguration({
      groups: ["RESIDENTIAL"],
      countryCode: country,
    });
    const proxyURL = await proxyConfig.newUrl();
    log.info("Using residential proxy URL", { proxyURL });

    const app = new Scraper(urls, country, proxyURL);
    const flipkartResults = await app.flipkart();

    await Actor.pushData(flipkartResults);
    await Actor.exit({ timeoutSecs: 0 });
  } catch (err) {
    log.error(err.message);
    await Actor.exit(err.message, { status: 1 });
  }
}

initializeActor();