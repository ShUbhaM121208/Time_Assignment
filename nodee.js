const http = require("http");
const https = require("https");

function fetchStories(callback) {
  https.get("https://time.com/feed/", (res) => {
    let data = "";

    res.on("data", chunk => data += chunk);

    res.on("end", () => {
      let items = data.split("<item>").slice(1);   // split by <item>, ignore first
      let stories = [];

      for (let i = 0; i < 6 && i < items.length; i++) {
        let block = items[i];

        // extract title
        let titleStart = block.indexOf("<title>") + 7;
        let titleEnd = block.indexOf("</title>");
        let title = block.substring(titleStart, titleEnd)
                        .replace("<![CDATA[", "")
                        .replace("]]>", "")
                        .trim();

        // extract link
        let linkStart = block.indexOf("<link>") + 6;
        let linkEnd = block.indexOf("</link>");
        let link = block.substring(linkStart, linkEnd).trim();

        stories.push({ title, link });
      }

      callback(stories);
    });
  }).on("error", err => {
    console.error("Error:", err);
    callback([]);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/getTimeStories") {
    fetchStories(stories => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stories, null, 2));
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(8080, () => {
  console.log("Server running at http://localhost:8080/getTimeStories");
});
