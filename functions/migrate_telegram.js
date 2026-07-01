const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccount.json')) });
const db = admin.firestore();

// One-time migration: add telegram_chat_id: null to all existing soldiers and families
// that don't already have the field. Safe to re-run — skips docs that already have it.
(async () => {
  const soldiers = await db.collection('soldiers').get();
  let soldiersUpdated = 0;
  for (const doc of soldiers.docs) {
    if (!('telegram_chat_id' in doc.data())) {
      await doc.ref.update({ telegram_chat_id: null });
      soldiersUpdated++;
    }
  }
  console.log(`Soldiers updated: ${soldiersUpdated}/${soldiers.size}`);

  const families = await db.collection('families').get();
  let familiesUpdated = 0;
  for (const doc of families.docs) {
    if (!('telegram_chat_id' in doc.data())) {
      await doc.ref.update({ telegram_chat_id: null });
      familiesUpdated++;
    }
  }
  console.log(`Families updated: ${familiesUpdated}/${families.size}`);

  console.log('Migration complete!');
  process.exit(0);
})();
