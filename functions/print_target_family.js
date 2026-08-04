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
  const res = await callEndpoint("getDebugLogs");
  const result = res.result || res;
  console.log("=== TARGET FAMILY DATA ===");
  console.log(JSON.stringify(result.targetFamilyData, null, 2));
  console.log("\n=== TARGET FAMILY HOSTINGS ===");
  console.log(JSON.stringify(result.targetFamilyHostings, null, 2));
  console.log("\n=== TARGET FAMILY MATCHES ===");
  console.log(JSON.stringify(result.targetFamilyMatches, null, 2));
  console.log("\n=== TARGET FAMILY NOTIFICATIONS ===");
  console.log(JSON.stringify(result.targetFamilyNotifs, null, 2));
}

main().catch(console.error);
