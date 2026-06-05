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

  // 4. Backfill guests array in family_hostings from existing active_matches
  // Needed for matches created before the Cloud Function was updated to write guests.
  const soldierCache = {};
  const getSoldier = async (id) => {
    if (!soldierCache[id]) {
      const snap = await db.collection('soldiers').doc(id).get();
      soldierCache[id] = snap.exists ? snap.data() : {};
    }
    return soldierCache[id];
  };

  const matches = await db.collection('active_matches')
    .where('status', '==', 'pending_soldier_approval')
    .get();

  let backfilled = 0;
  for (const matchDoc of matches.docs) {
    const match = matchDoc.data();
    if (!match.host_offer_id || match.guest_object) continue; // skip already-backfilled

    const reqSnap = await db.collection('soldier_hosting_searches').doc(match.soldier_request_id).get();
    if (!reqSnap.exists) continue;
    const req = reqSnap.data();

    const soldier = await getSoldier(req.soldier_id);
    const guestCount = req.guestCount ?? 1;

    const guestObj = {
      match_id:       matchDoc.id,
      soldier_id:     req.soldier_id,
      name:           soldier.fullName ?? soldier.name ?? 'חייל',
      unit:           soldier.unit    ?? null,
      age:            soldier.age     ?? null,
      avatarColor:    soldier.avatarPreview ?? '#6f8f72',
      kosher:         req.kosher  ?? 'none',
      allergies:      soldier.allergies ?? [],
      bio:            soldier.bio ?? null,
      needSleep:      req.needSleep  ?? false,
      needsTransport: req.transport  ?? false,
      walkDistance:   req.walkDistance ?? false,
      groupSize:      guestCount,
    };

    const hostingRef = db.collection('family_hostings').doc(match.host_offer_id);
    const hostingSnap = await hostingRef.get();
    if (!hostingSnap.exists) continue;

    const existingGuests = hostingSnap.data().guests || [];
    if (existingGuests.some(g => g.match_id === matchDoc.id)) continue; // already there

    const updatedGuests = [...existingGuests, guestObj];
    const newTotal = updatedGuests.reduce((s, g) => s + (g.groupSize || 1), 0);
    const capacity = parseInt(hostingSnap.data().soldiers) || 0;

    await hostingRef.update({
      guests: updatedGuests,
      is_fully_booked: capacity > 0 && newTotal >= capacity,
    });
    await matchDoc.ref.update({ guest_object: guestObj });
    backfilled++;
  }
  console.log('Matches backfilled:', backfilled, '/', matches.size);

  // 5. Set status:'open' on hostings that have no status field
  const hostings = await db.collection('family_hostings').get();
  let hostingsFixed = 0;
  for (const d of hostings.docs) {
    if (!d.data().status) {
      await d.ref.update({ status: 'open' });
      hostingsFixed++;
    }
  }
  console.log('Hostings status fixed:', hostingsFixed, '/', hostings.size);

  console.log('Migration complete!');
  process.exit(0);
})();
