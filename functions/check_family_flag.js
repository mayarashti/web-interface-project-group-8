const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({ projectId: "memulaim-88a26" });
const db = getFirestore();

async function checkFamily() {
  const familyId = "oEkbSNCmbubKv4zlZSp3B8LzMiU2";
  console.log(`🔍 Checking family document for ID: ${familyId}...`);

  const snap = await db.collection("families").doc(familyId).get();
  if (!snap.exists) {
    console.log("❌ Family document does not exist!");
    return;
  }

  const data = snap.data();
  console.log("📄 Family Data:");
  console.log(`  Name: ${data.hostName}`);
  console.log(`  City: ${data.hostCity}`);
  console.log(`  accepted_24h_dates:`, data.accepted_24h_dates);
  console.log(`  took_24h_dates:`, data.took_24h_dates);
  console.log("Full data:", JSON.stringify(data, null, 2));

  console.log("\n🔍 Checking active matches for this family...");
  const matchesSnap = await db.collection("active_matches")
    .where("family_id", "==", familyId)
    .get();
  
  console.log(`Found ${matchesSnap.docs.length} active matches for this family:`);
  matchesSnap.docs.forEach(doc => {
    console.log(`Match ID: ${doc.id}`, doc.data());
  });
}

checkFamily().catch(console.error);
