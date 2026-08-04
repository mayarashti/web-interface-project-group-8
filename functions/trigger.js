const https = require("https");

const data = JSON.stringify({ data: {} });

const req = https.request("https://us-central1-memulaim-88a26.cloudfunctions.net/forceCheckPendingRequests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
}, (res) => {
  let body = "";
  res.on("data", (chunk) => { body += chunk; });
  res.on("end", () => {
    console.log("Response:", body);
  });
});

req.on("error", (e) => {
  console.error("Error:", e);
});

req.write(data);
req.end();
