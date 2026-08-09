const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
// Wait, the functions run locally with an emulator maybe? The prompt didn't say, but index.js has emulator logic.
// Let's just try initializing and exit.

initializeApp();
const db = getFirestore();

async function main() {
  const soldierId = "MRxdj67TNTZ6f359eQSOLBmowNg1";
  const familyId = "hI6Uaw7mQbUDOhnyzsKvUE8JbFr2";

  console.log("Fetching soldier...");
  const soldierDoc = await db.collection("soldiers").doc(soldierId).get();
  if (soldierDoc.exists) {
    const s = soldierDoc.data();
    console.log("Soldier:", s.name, "| City:", s.city, "| Lat:", s.lat, "| Lng:", s.lng);
  } else {
    console.log("Soldier not found");
  }

  console.log("Fetching family...");
  const familyDoc = await db.collection("families").doc(familyId).get();
  if (familyDoc.exists) {
    const f = familyDoc.data();
    console.log("Family:", f.hostName, "| City:", f.city, "| Lat:", f.hostLat, "| Lng:", f.hostLng);
  } else {
    console.log("Family not found");
  }
  
  // also fetch request
  const reqId = "cRQm4dPwg9H2ay9cvzvo";
  console.log("Fetching request...");
  const reqDoc = await db.collection("soldier_hosting_searches").doc(reqId).get();
  if (reqDoc.exists) {
    const r = reqDoc.data();
    console.log("Request City:", r.city, "| Lat:", r.lat, "| Lng:", r.lng);
  } else {
    console.log("Request not found");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
