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
  const target = process.argv[2] || "both";
  if (target === "run" || target === "both") {
    console.log("🚀 Calling forceCheckPendingRequests...");
    const runRes = await callEndpoint("forceCheckPendingRequests");
    console.log("Run Result:", JSON.stringify(runRes, null, 2));
  }

  if (target === "logs" || target === "both") {
    console.log("\n📋 Fetching getDebugLogs...");
    const logsRes = await callEndpoint("getDebugLogs");
    console.log("Debug Logs:", JSON.stringify(logsRes, null, 2));
  }
}

main().catch(console.error);
