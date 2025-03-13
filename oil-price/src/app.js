import { Actor, log } from "apify";
import * as cheerio from "cheerio";
import fs from "fs";

async function getPlaces() {
  const testUrl =
    "https://www.google.com/maps/search/louvre+museum+in+paris/?hl=en";

  fetch(testUrl)
    .then((data) => data.text())
    .then((i) => fs.writeFileSync("./test.html", i, "utf-8"));
}
getPlaces();
