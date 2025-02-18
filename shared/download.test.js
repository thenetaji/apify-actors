import download from "./download.js";

(async () => {
  const options = [
    "https://youtube.com/shorts/QbP3wdFQUCk?si=BTFROln_oqptCvbJ",
    "https://youtube.com/shorts/RISVHRhrCrk?si=PCV4QPP0uOR4vL7D",
  ];
  const res = await download(options);
  console.log(res);
})();
