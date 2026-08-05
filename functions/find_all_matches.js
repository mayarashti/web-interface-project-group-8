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
  console.log("=== ALL ACTIVE MATCHES IN FIRESTORE ===");
  console.log(JSON.stringify(result.allActiveMatches, null, 2));

  console.log("\n=== FAMILIES WITH ACCEPTED_24H_DATES OR TOOK_24H_DATES ===");
  const flagged = result.registeredFamilies.filter(f => f.accepted_24h_dates || f.took_24h_dates);
  console.log(JSON.stringify(flagged, null, 2));
}

main().catch(console.error);
