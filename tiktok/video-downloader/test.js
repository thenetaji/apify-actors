const string = `🚀🚀#farrier #farriersoftiktok #asmr #satisfying #farrierlife #horse #horses #horsesoftiktok #hoof #care #animalwelfare
https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/oY1XgfHLDD9nFsPEtZEmMzQmrBSI7aJgmtRfbA/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=5370&bt=2685&cs=2&ds=4&ft=4fUEKMMD8Zmo0y-Lyb4jVNAeypWrKsd.&mime_type=video_mp4&qs=15&rc=NWlnOWUzZDhoM2Y0NDlnaUBpajZ4c205cnVmeDMzZzczNEBiNC1eMjFgXjExYTExYTIuYSNqNmBiMmRjYWpgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1740887842&l=20250228035600460B8DE8B3CE891441AD&ply_type=2&policy=2&signature=375aeea76e918acff758d5c3c3a3572a&tk=tt_chain_token
#محمد_موصللي #جيفارا_العلي #سوريا_تركيا_العراق_السعودية_الكويت
https://v19-webapp-prime.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/oMUBeAGfsytMYLMLe1tDAAgiAgxeKhBRNf0ZIp/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=1056&bt=528&cs=2&ds=3&eid=16896&ft=4fUEKMMD8Zmo0w-Lyb4jVcge8pWrKsd.&mime_type=video_mp4&qs=14&rc=ODU4aTxkODRlaGVlaDNkZEBpanVlcHc5cjNmeDMzODczNEBgXzQwMDFgXl8xLl9eYjVgYSNhaC8zMmRjZHNgLS1kMTFzcw%3D%3D&btag=e00088000&expire=1740887821&l=20250228035606E0D0FF9AC1A7B6117E88&ply_type=2&policy=2&signature=83e6efa4e1d534b5d15cadaf5518aa51&tk=tt_chain_token`;

let title = "";
const extractedData = [];
const data = string.split("\n").forEach((item) => {
  if (item.startsWith("http")) {
    extractedData.push({
      title: title.trim(),
      downloadUrl: item.trim(),
    });
    title = "";
  } else {
    title = item;
  }
});

console.log(extractedData);
