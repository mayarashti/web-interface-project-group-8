const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccount.json')) });
const db = admin.firestore();

// Old → new value maps
const KR = { kosher: 'separated', kitchen: 'mehadrin' };
const SR = { yes: 'keeps', no: 'none', observant: 'keeps', secular: 'none' };
const LR = { 'עברית': 'he', 'אנגלית': 'en', 'רוסית': 'ru', 'ספרדית': 'es', 'ערבית': 'ar' };

(async () => {
  // 1. soldiers — kosher, shabbatKeeps
  const soldiers = await db.collection('soldiers').get();
  const levels = {};
  for (const d of soldiers.docs) {
    const p = {};
    if (KR[d.data().kosher])       p.kosher       = KR[d.data().kosher];
    if (SR[d.data().shabbatKeeps]) p.shabbatKeeps = SR[d.data().shabbatKeeps];
    levels[d.id] = {
      kosher:  p.kosher       || d.data().kosher,
      shabbat: p.shabbatKeeps || d.data().shabbatKeeps,
    };
    if (Object.keys(p).length) await d.ref.update(p);
  }
  console.log('Soldiers done:', soldiers.size);

  // 2. families — hostKosher, hostLanguages (migrate values + delete stray `languages` field)
  const fams = await db.collection('families').get();
  for (const d of fams.docs) {
    const p = {};
    if (KR[d.data().hostKosher]) p.hostKosher = KR[d.data().hostKosher];
    const langs = d.data().hostLanguages;
    if (Array.isArray(langs)) {
      const migrated = langs.map(l => LR[l] || l);
      if (migrated.join() !== langs.join()) p.hostLanguages = migrated;
    }
    // Remove the stray `languages` field — families use `hostLanguages` only
    if ('languages' in d.data()) p.languages = admin.firestore.FieldValue.delete();
    if (Object.keys(p).length) await d.ref.update(p);
  }
  console.log('Families done:', fams.size);

  // 3. soldier_hosting_searches — kosher + shabbat were booleans
  const reqs = await db.collection('soldier_hosting_searches').get();
  for (const d of reqs.docs) {
    const p = {};
    const sl = levels[d.data().soldier_id] || {};
    if (typeof d.data().kosher  === 'boolean') p.kosher  = d.data().kosher  ? (sl.kosher  || 'separated') : 'none';
    if (typeof d.data().shabbat === 'boolean') p.shabbat = d.data().shabbat ? (sl.shabbat || 'keeps')     : 'none';
    if (KR[d.data().kosher])  p.kosher  = KR[d.data().kosher];
    if (SR[d.data().shabbat]) p.shabbat = SR[d.data().shabbat];
    if (Object.keys(p).length) await d.ref.update(p);
  }
  console.log('Requests done:', reqs.size);

  console.log('Migration complete!');
  process.exit(0);
})();
