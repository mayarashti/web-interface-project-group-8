const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({ projectId: "memulaim-88a26" });
const db = getFirestore();

async function checkLogs() {
  console.log("--- RECENT NOTIFICATIONS ---");
  const snap = await db.collection("notifications").orderBy("sent_at", "desc").limit(10).get();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    console.log(`ID: ${doc.id}`);
    console.log(`  Role: ${data.role}`);
    console.log(`  User ID: ${data.user_id}`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Content: ${data.content}`);
    console.log(`  Type: ${data.type}`);
    console.log(`  Sent At: ${data.sent_at?.toDate ? data.sent_at.toDate() : data.sent_at}`);
    console.log("----------------------------");
  });

  console.log("\n--- UNMATCHED SOLDIER SEARCHES (TODAY & TOMORROW) ---");
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const searchesSnap = await db.collection("soldier_hosting_searches")
    .where("is_match", "==", false)
    .where("when", "in", [todayStr, tomorrowStr])
    .get();

  console.log(`Found ${searchesSnap.docs.length} unmatched searches:`);
  searchesSnap.docs.forEach((doc) => {
    console.log(`Request ID: ${doc.id}`, doc.data());
  });

  console.log("\n--- AVAILABLE FAMILY HOSTINGS (TODAY & TOMORROW) ---");
  const hostingsSnap = await db.collection("family_hostings")
    .where("is_fully_booked", "==", false)
    .where("date", "in", [todayStr, tomorrowStr])
    .get();

  console.log(`Found ${hostingsSnap.docs.length} available hostings:`);
  hostingsSnap.docs.forEach((doc) => {
    console.log(`Hosting ID: ${doc.id}`, doc.data());
  });
}

checkLogs().catch(console.error);
