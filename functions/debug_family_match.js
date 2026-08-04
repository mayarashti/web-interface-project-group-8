const https = require("https");

function callEndpoint(functionName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ data: {} });
    const req = https.request(`https://us-central1-memulaim-88a26.cloudfunctions.net/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("🔍 Triggering 24h algorithm run...");
  await callEndpoint("forceCheckPendingRequests");
}

main().catch(console.error);
