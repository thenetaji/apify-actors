import { Actor } from "apify";
import axios from "axios";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import puppeteer from "puppeteer";

import log from "./shared/logger.js";

const proxyList = [
  "http://nbnhvirp:gv64vkwqgjye@198.23.239.134:6540",
  "http://nbnhvirp:gv64vkwqgjye@207.244.217.165:6712",
  "http://nbnhvirp:gv64vkwqgjye@107.172.163.27:6543",
  "http://nbnhvirp:gv64vkwqgjye@64.137.42.112:5157",
  "http://nbnhvirp:gv64vkwqgjye@173.211.0.148:6641",
  "http://nbnhvirp:gv64vkwqgjye@161.123.152.115:6360",
  "http://nbnhvirp:gv64vkwqgjye@23.94.138.75:6349",
  "http://nbnhvirp:gv64vkwqgjye@154.36.110.199:6853",
  "http://nbnhvirp:gv64vkwqgjye@173.0.9.70:5653",
  "http://nbnhvirp:gv64vkwqgjye@173.0.9.209:5792",
];

/**
 * Extracts and returns product data from ecommerce sites
 * @class Scraper
 */
class Scraper {
  /**
   * Receives url and cc of a site and returns the html code
   * @param {object} params
   * @param {string} params.url
   * @param {string} params.cc - Country code. Used in the proxy to fetch the site from that specific country
   */
  constructor({ url, proxyUrl, cc }) {
    this.url = url;
    this.proxyUrl = proxyUrl;
    this.cc = cc;
  }

  async Amazon() {
    try {
      const { title, price } = await this.extractProductDetails();
    } catch (err) {
      log.error({
        message: "Error at Scraper:Amazon while fetching",
        error: err,
      });
      throw new Error(`Error occurred while fetching site: ${err.message}`);
    }
  }

  async extractProductDetails({
  	titlePattern,
  	pricePattern
  }) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--proxy-server=${this.proxyUrl}`,
      ],
    });
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      );

      await page.goto(this.url, { waitUntil: "domcontentloaded" });

      await page.waitForSelector();
      
      const title = await page.evalute(() => {});
      const price = await page.evaluate(() => {});
      
    } catch (error) {
      log.error({
        message: "Error extracting details",
        error: error,
      });
      throw new Error("Failed to extract details.");
    } finally {
      await browser.close();
    }
  }
}

const app = new Scraper();
const amazon = await app.Amazon({
  url: "https://amzn.in/d/9ETszqv",
});

//http://ip-api.com/json/
