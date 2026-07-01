const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Google Maps key — stored as a Functions secret, never shipped to the browser.
// Set once with:  firebase functions:secrets:set GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = defineSecret("GOOGLE_MAPS_API_KEY");

// Telegram bot token — stored as a Functions secret.
// Set once with:  firebase functions:secrets:set TELEGRAM_BOT_TOKEN
const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");

// Bind secrets to every function.
setGlobalOptions({ maxInstances: 10, secrets: [GOOGLE_MAPS_API_KEY, TELEGRAM_BOT_TOKEN] });

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS HELPER
// Creates a notification document in the `notifications` collection.
//
// Fields:
//   user_id  — UID of the recipient
//   role     — 'soldier' | 'host'
//   title    — short heading (optional)
//   content  — full message text
//   type     — machine-readable category (e.g. 'match', 'cancel', 'reminder')
//   read     — always false on creation
//   sent_at  — server timestamp
//
// Usage inside any Cloud Function:
//   await createNotification('uid123', 'soldier', 'נמצאה משפחה מארחת!', 'match', 'התאמה חדשה');
// ─────────────────────────────────────────────────────────────────────────────
async function createNotification(userId, role, content, type = 'general', title = '', payload = {}) {
  await db.collection('notifications').add({
    user_id: userId,
    role,
    title,
    content,
    type,
    payload,
    read: false,
    sent_at: FieldValue.serverTimestamp(),
  });

  // Mirror to Telegram if the user has connected their account.
  try {
    const collection = role === 'host' ? 'families' : 'soldiers';
    const userSnap = await db.collection(collection).doc(userId).get();
    const chatId = userSnap.exists ? userSnap.data().telegram_chat_id : null;
    if (chatId) {
      const token = TELEGRAM_BOT_TOKEN.value();
      const text = title ? `<b>${title}</b>\n\n${content}` : content;
      await sendTelegramMessage(token, chatId, text);
    }
  } catch (e) {
    console.error('Telegram mirror error:', e);
  }
}

// ─── Compromise levels (applied in order after 24h) ───────────────
const COMPROMISE = {
  NONE:   0,  // strict matching only
  RADIUS: 1,  // expand travelDistance by 20%
  PETS:   2,  // allow hasPets:true even if petsComfort:"no"
  TIME:   3,  // allow ±2h flexibility in arrival time
};

// ──────────────────────────────────────────────────────────────────
// KOSHER COMPATIBILITY
// Unified values for both soldier and family: "none" | "separated" | "mehadrin"
// Family must be at same level or higher than the soldier's need.
// ──────────────────────────────────────────────────────────────────
function isKosherCompatible(requestKosher, familyKosher) {
  const rank = { mehadrin: 2, separated: 1, none: 0 };
  return (rank[familyKosher] ?? 0) >= (rank[requestKosher] ?? 0);
}

// ──────────────────────────────────────────────────────────────────
// SHABBAT COMPATIBILITY
// Unified values for both soldier and family: "none" | "traditional" | "keeps"
//   "none"        → soldier doesn't care, any family is ok
//   "traditional" → family must be "traditional" or "keeps"
//   "keeps"       → family must be "keeps"
// ──────────────────────────────────────────────────────────────────
function isShabbatCompatible(requestShabbat, familyShabbat) {
  if (!requestShabbat || requestShabbat === "none") return true;
  if (requestShabbat === "traditional") return familyShabbat === "traditional" || familyShabbat === "keeps";
  return familyShabbat === "keeps"; // "keeps"
}

// ──────────────────────────────────────────────────────────────────
// TIME COMPATIBILITY
// Soldier has startTime/endTime ("19:00"/"22:00")
// Family has a single time field ("18:35") — must fall inside soldier's window
// flexMinutes expands the window in compromise mode (±120 min)
// ──────────────────────────────────────────────────────────────────
function toMinutes(timeStr) {
  if (!timeStr || !timeStr.match(/^\d{1,2}:\d{2}$/)) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function isTimeCompatible(soldierStart, soldierEnd, familyTime, flexMinutes = 0) {
  const famMin = toMinutes(familyTime);
  const startMin = toMinutes(soldierStart);
  const endMin = toMinutes(soldierEnd);
  if (famMin === null || startMin === null || endMin === null) return true; // can't check → allow
  return famMin >= (startMin - flexMinutes) && famMin <= (endMin + flexMinutes);
}

// ──────────────────────────────────────────────────────────────────
// GEOGRAPHY — Haversine distance in km
// ──────────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Default search radius (km) when a soldier didn't specify travelDistance.
// Deliberately modest so "no preference" doesn't silently match across the country.
const DEFAULT_RADIUS_KM = 30;

const isNum = (n) => typeof n === "number" && !Number.isNaN(n);

// Proximity bonus: closer families score higher. Full bonus (30) at the
// soldier's location, fading linearly to 0 at the edge of their radius.
// Unknown distance (missing coords) is neutral (0) so it neither helps nor
// blocks the match.
function proximityScore(distanceKm, radiusKm) {
  if (!isNum(distanceKm) || !isNum(radiusKm) || radiusKm <= 0) return 0;
  const ratio = Math.min(distanceKm / radiusKm, 1);
  return Math.round((1 - ratio) * 30);
}

// ──────────────────────────────────────────────────────────────────
// GOOGLE DISTANCE MATRIX — real travel distance (km) from one soldier to
// many candidate families in a single request. Returns an array aligned
// with `destinations`; each entry is km or null when unavailable. Any
// failure (API disabled, network, billing) returns nulls so the caller
// falls back to straight-line haversine. Requires the Distance Matrix API
// enabled on the project and the GOOGLE_MAPS_API_KEY secret.
// ──────────────────────────────────────────────────────────────────
async function fetchTravelDistancesKm(origin, destinations, mode = "driving") {
  const nulls = destinations.map(() => null);
  if (!isNum(origin?.lat) || !isNum(origin?.lng) || destinations.length === 0) return nulls;

  let key;
  try { key = GOOGLE_MAPS_API_KEY.value(); } catch (_) { return nulls; }
  if (!key) return nulls;

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destinations", destinations.map((d) => `${d.lat},${d.lng}`).join("|"));
  url.searchParams.set("mode", mode);
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("distanceMatrix http error", res.status);
      return nulls;
    }
    const json = await res.json();
    if (json.status !== "OK") {
      console.error("distanceMatrix google status", json.status, json.error_message);
      return nulls;
    }
    const elements = json.rows?.[0]?.elements || [];
    return destinations.map((_, i) => {
      const el = elements[i];
      return el && el.status === "OK" && el.distance ? el.distance.value / 1000 : null;
    });
  } catch (e) {
    console.error("distanceMatrix fetch failed", e);
    return nulls;
  }
}

// ──────────────────────────────────────────────────────────────────
// HARD FILTER — returns false if this family cannot host this soldier
// ──────────────────────────────────────────────────────────────────
function passesHardFilters(soldier, request, family, hosting, bannedIds, compromiseLevel) {
  // Ban list (permanent + per-request)
  if (bannedIds.has(hosting.family_id)) return false;

  // Capacity — only confirmed guests (in hosting.guests) count against the limit.
  // Pending (unconfirmed) matches do NOT reserve a spot: first to confirm wins.
  const maxGuests = parseInt(hosting.soldiers) || 0;
  const confirmedCount = (hosting.guests || []).reduce((s, g) => s + (g.groupSize || 1), 0);
  const available = maxGuests - confirmedCount;
  if (available < (request.guestCount ?? 1)) return false;

  // Shabbat — never compromised
  if (!isShabbatCompatible(request.shabbat, family.hostShabbat)) return false;

  // Kosher — never compromised
  if (request.kosher && request.kosher !== "none") {
    if (!isKosherCompatible(request.kosher, family.hostKosher)) return false;
  }

  // Diet/Allergies — soldier's allergies must be covered by family's cooking.
  // Map soldier allergy IDs to the corresponding family cooking IDs (they use
  // different id strings for the same concept).  Allergies with no family-side
  // equivalent ('peanuts', 'fish', 'other') are skipped — we cannot enforce
  // them via the family cooking list and blocking matches over them is wrong.
  const ALLERGY_TO_COOKING = { gluten: "celiac", vegetarian: "veg" };
  const UNMATCHABLE = new Set(["peanuts", "fish", "other"]);
  const soldierAllergies = (soldier.allergies ?? [])
    .filter((a) => !UNMATCHABLE.has(a))
    .map((a) => ALLERGY_TO_COOKING[a] ?? a);
  const familyCooking = family.hostCooking ?? [];
  if (soldierAllergies.some((a) => !familyCooking.includes(a))) return false;

  // Accommodation — if soldier needs to sleep over, family must offer it
  if (request.needSleep === true && hosting.sleepOvernight !== true) return false;

  // If the soldier is allergic to animals and the family has a life - a rigid restriction, there is no possibility of adjustment.
if (soldier.pets === "allergy" && family.hasPets === true) return false; 

  // Pets — hard filter unless we're in PETS compromise mode
  if (compromiseLevel < COMPROMISE.PETS) {
    if (request.petsComfort === "no" && family.hasPets === true) return false;
  }
  // Note: even in compromise mode we still apply "no" as hard if you want —
  // the user said petsComfort only has "ok"/"no", not "allergic".
  // Since there's no "allergic" value, "no" becomes a soft compromise.

  // Time window — compromised in TIME mode (±2h = 120 min)
  if (compromiseLevel < COMPROMISE.TIME) {
    if (!isTimeCompatible(request.startTime, request.endTime, hosting.time, 0)) return false;
  } else {
    if (!isTimeCompatible(request.startTime, request.endTime, hosting.time, 120)) return false;
  }

  // NOTE: the geographic radius is NOT enforced here. Distance needs one
  // batched Google Distance Matrix call for all candidates at once, so it is
  // handled in runMatchingForRequest after the cheap hard filters run.

  return true;
}

// ──────────────────────────────────────────────────────────────────
// SCORING — higher = better match (soft preferences)
// ──────────────────────────────────────────────────────────────────
  function scoreFamily(soldier, request, family, hosting) {
    let score = 0;

    // Shared languages — both sides now use the same codes: "he" | "en" | "ru" | "es" | "ar" | "other"
    const soldierLangs = soldier.languages ?? [];
    const familyLangs = family.hostLanguages ?? [];
    const sharedLangs = soldierLangs.filter((l) => familyLangs.includes(l));
    score += sharedLangs.length * 10;

    // Transportation — soldier needs pickup and family offers it
    if (request.transport === true && hosting.pickup === true) score += 15;

    // Pets — soldier is ok with pets and family has pets (positive vibe match)
    if (request.petsComfort === "ok" && family.hasPets === true) score += 5;

    // No pets and soldier prefers no pets
    if (request.petsComfort === "no" && family.hasPets === false) score += 10;

    // Exact kosher level match bonus
    if (request.kosher && request.kosher !== "none" && request.kosher === family.hostKosher) score += 10;
    if (request.kosher === "separated" && family.hostKosher === "mehadrin") score += 5;

    // Shabbat bonus — traditional family is a bonus when soldier didn't require shabbat
    if ((!request.shabbat || request.shabbat === "none") && family.hostShabbat === "traditional") score += 5;

        // Exact Shabbat level match bonus
    if (request.shabbat && request.shabbat !== "none" && request.shabbat === family.hostShabbat) score += 10;

    return score;
  }

// ──────────────────────────────────────────────────────────────────
// BUILD COMPROMISE NOTIFICATIONS for the soldier
// ──────────────────────────────────────────────────────────────────
function buildCompromiseNotes(request, family, compromiseLevel) {
  const notes = [];
  if (compromiseLevel >= COMPROMISE.PETS && family.hasPets && request.petsComfort === "no") {
    notes.push(`מצאנו לך משפחה, אבל יש להם חיות מחמד (${family.petsDetails ?? ""}). האם תרצה להתארח בכל זאת?`);
  }
  if (compromiseLevel >= COMPROMISE.RADIUS) {
    notes.push("מצאנו לך משפחה מעט מחוץ לרדיוס החיפוש המועדף שלך.");
  }
  if (compromiseLevel >= COMPROMISE.TIME) {
    notes.push("שעת ההגעה של המשפחה אינה זהה לטווח שלך, אך קרובה (±2 שעות).");
  }
  return notes;
}

// ──────────────────────────────────────────────────────────────────
// CORE MATCHING ENGINE
// Tries to find the best family for a given soldier request.
// Returns the match data or null if no match found.
// ──────────────────────────────────────────────────────────────────
async function runMatchingForRequest(requestId, compromiseLevel = COMPROMISE.NONE) {
  const requestSnap = await db.collection("soldier_hosting_searches").doc(requestId).get();
  if (!requestSnap.exists) return null;
  const request = requestSnap.data();
  if (request.is_match) return null; // already matched

  const soldierSnap = await db.collection("soldiers").doc(request.soldier_id).get();
  if (!soldierSnap.exists) return null;
  const soldier = soldierSnap.data();

  // Build combined ban list
  const bannedIds = new Set([
    ...(soldier.banned_families ?? []),
    ...(request.temporarily_banned_families ?? []),
  ]);

  // Query available family hostings for the same date
  const hostingsSnap = await db
    .collection("family_hostings")
    .where("date", "==", request.when)
    .where("is_fully_booked", "==", false)
    .get();

  if (hostingsSnap.empty) return null;

  const prelim = [];

  for (const hostingDoc of hostingsSnap.docs) {
    const hosting = hostingDoc.data();

    // Skip canceled hostings — they may still appear in the query if
    // is_fully_booked was not set when status was changed to "canceled"
    if (hosting.status === "canceled") continue;

    const familySnap = await db.collection("families").doc(hosting.family_id).get();
    if (!familySnap.exists) continue;
    const family = familySnap.data();

    if (!passesHardFilters(soldier, request, family, hosting, bannedIds, compromiseLevel)) continue;

    prelim.push({ hosting, family });
  }

  if (prelim.length === 0) return null;

  // ── LOCATION ────────────────────────────────────────────────────
  // travelDistance is the soldier's max acceptable distance (km). In RADIUS
  // compromise mode we widen it by 20%. Distances come from Google Distance
  // Matrix (real road/walking distance) and fall back to straight-line
  // haversine when the API or family coordinates are unavailable.
  let radius = isNum(request.travelDistance) ? request.travelDistance : DEFAULT_RADIUS_KM;
  if (compromiseLevel >= COMPROMISE.RADIUS) radius *= 1.2;

  const hasSoldierCoords = isNum(request.lat) && isNum(request.lng);

  // Straight-line estimate first (cheap, always available).
  const distances = prelim.map(({ family }) =>
    hasSoldierCoords && isNum(family.hostLat) && isNum(family.hostLng)
      ? haversineKm(request.lat, request.lng, family.hostLat, family.hostLng)
      : null
  );

  // Refine with real travel distance in a single Distance Matrix call.
  if (hasSoldierCoords) {
    const refinable = prelim
      .map((c, i) => ({ i, family: c.family }))
      .filter(({ family }) => isNum(family.hostLat) && isNum(family.hostLng));
    if (refinable.length > 0) {
      const mode = (soldier.walkDistance || request.walkDistance) ? "walking" : "driving";
      const real = await fetchTravelDistancesKm(
        { lat: request.lat, lng: request.lng },
        refinable.map(({ family }) => ({ lat: family.hostLat, lng: family.hostLng })),
        mode
      );
      refinable.forEach(({ i }, k) => { if (isNum(real[k])) distances[i] = real[k]; });
    }
  }

  // Enforce the radius (only when the distance is actually known) and score,
  // adding a proximity bonus so the closest acceptable family wins.
  const candidates = [];
  prelim.forEach((c, i) => {
    const distanceKm = distances[i];
    if (hasSoldierCoords && isNum(distanceKm) && distanceKm > radius) return; // too far
    candidates.push({
      ...c,
      distanceKm,
      score: scoreFamily(soldier, request, c.family, c.hosting) + proximityScore(distanceKm, radius),
    });
  });

  if (candidates.length === 0) return null;

  // Highest score wins; ties broken by the closer family.
  candidates.sort(
    (a, b) => (b.score - a.score) || ((a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  );
  const best = candidates[0];

  const compromiseNotes = buildCompromiseNotes(request, best.family, compromiseLevel);

  // Save the match — guest details are NOT stored here; use soldier_request_id
  // to look them up from soldier_hosting_searches + soldiers when needed.
  const matchRef = db.collection("active_matches").doc();

  await matchRef.set({
    id: matchRef.id,
    soldier_request_id: requestId,
    soldier_id: request.soldier_id,             // stored for fast notification lookups
    host_offer_id: best.hosting.id,
    family_id: best.family.id,
    family_name: best.family.hostName ?? null,
    family_city: best.family.hostCity ?? null,
    hosting_date: best.hosting.date ?? null,
    group_size: request.guestCount ?? 1,        // stored so triggers can check capacity without extra reads
    status: "pending_soldier_approval",
    score: best.score,
    distance_km: isNum(best.distanceKm) ? Math.round(best.distanceKm * 10) / 10 : null,
    compromise_level: compromiseLevel,
    compromise_notes: compromiseNotes,
    created_at: new Date().toISOString(),
    reminders_sent: [],
  });

  // Mark soldier request as matched
  await db.collection("soldier_hosting_searches").doc(requestId).update({ is_match: true });

  // Notify soldier: new assignment found
  try {
    await createNotification(
      request.soldier_id, "soldier",
      `נמצאה לך משפחה מארחת: ${best.family.hostName ?? "משפחה"} ב${best.family.hostCity ?? ""}. היכנס לאפליקציה כדי לאשר את הגעתך.`,
      "new_match",
      "שיבוץ חדש!",
      { request_id: requestId }
    );
  } catch (e) { console.error("notification error (new_match):", e); }

  // Note: family_hostings.guests is updated only when the soldier confirms arrival
  // (via the confirmMatch callable), not at match creation time.

  return {
    match_id: matchRef.id,
    family_name: best.family.hostName,
    family_city: best.family.hostCity,
    hosting_id: best.hosting.id,
    score: best.score,
    compromise_notes: compromiseNotes,
  };
}

// ──────────────────────────────────────────────────────────────────
// ARCHIVE HELPER — copy a doc to its archive collection, then delete
// ──────────────────────────────────────────────────────────────────
async function archiveDoc(sourceCollection, archiveCollection, docId, finalStatus) {
  const ref = db.collection(sourceCollection).doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return;
  await db.collection(archiveCollection).doc(docId).set({
    ...snap.data(),
    final_status: finalStatus,
    archived_at: new Date().toISOString(),
  });
  await ref.delete();
}

// Try all compromise levels in order until a match is found
async function tryAllCompromiseLevels(requestId) {
  for (const level of [COMPROMISE.NONE, COMPROMISE.RADIUS, COMPROMISE.PETS, COMPROMISE.TIME]) {
    const result = await runMatchingForRequest(requestId, level);
    if (result) return result;
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────
// TRIGGER: new soldier request → scan available family hostings
// ──────────────────────────────────────────────────────────────────
exports.onNewSoldierRequest = onDocumentCreated(
  { document: "soldier_hosting_searches/{requestId}", region: "me-west1" },
  async (event) => {
    const requestId = event.params.requestId;
    const requestDate = event.data.data().when;
    const today    = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const isUrgent = requestDate === today || requestDate === tomorrow;
    console.log("🔔 onNewSoldierRequest triggered for:", requestId, "urgent:", isUrgent);
    try {
      const result = isUrgent
        ? await tryAllCompromiseLevels(requestId)
        : await runMatchingForRequest(requestId, COMPROMISE.NONE);
      console.log("✅ Matching result:", JSON.stringify(result));
    } catch (err) {
      console.error("❌ Error in onNewSoldierRequest:", err);
    }
  }
);

// ──────────────────────────────────────────────────────────────────
// TRIGGER: new family hosting → scan unmatched soldier requests
// ──────────────────────────────────────────────────────────────────
exports.onNewFamilyHosting = onDocumentCreated(
  { document: "family_hostings/{hostingId}", region: "me-west1" },
  async (event) => {
    console.log("🔔 onNewFamilyHosting triggered for:", event.params.hostingId);
    const hosting = event.data.data();

    const unmatchedSnap = await db
      .collection("soldier_hosting_searches")
      .where("when", "==", hosting.date)
      .where("is_match", "==", false)
      .get();

    const today    = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const isUrgent = hosting.date === today || hosting.date === tomorrow;

    for (const doc of unmatchedSnap.docs) {
      if (isUrgent) {
        await tryAllCompromiseLevels(doc.id);
      } else {
        await runMatchingForRequest(doc.id, COMPROMISE.NONE);
      }
    }
  }
);

// ──────────────────────────────────────────────────────────────────
// SCHEDULED: every hour — apply compromise for requests within 24h
// ──────────────────────────────────────────────────────────────────
exports.checkPendingRequests = onSchedule("every 60 minutes", async () => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const snap = await db
    .collection("soldier_hosting_searches")
    .where("is_match", "==", false)
    .where("when", "in", [todayStr, tomorrowStr])
    .get();

  for (const doc of snap.docs) {
    await tryAllCompromiseLevels(doc.id);
  }

  // Safety net: find pending matches whose hosting became full in the meantime.
  // This catches cases where confirmMatch didn't run (e.g. direct Firestore write).
  const pendingSnap = await db
    .collection("active_matches")
    .where("status", "==", "pending_soldier_approval")
    .get();

  for (const matchDoc of pendingSnap.docs) {
    const match = matchDoc.data();
    if (!match.host_offer_id) continue;

    const hostingSnap = await db.collection("family_hostings").doc(match.host_offer_id).get();
    if (!hostingSnap.exists || !hostingSnap.data().is_fully_booked) continue;

    // Hosting is full — this pending match is no longer viable
    await db.collection("active_match_archive").doc(matchDoc.id).set({
      ...match,
      final_status: "no_spot_left",
      archived_at: new Date().toISOString(),
    });
    await matchDoc.ref.delete();

    await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
      is_match: false,
      notification: "no_spot_left",
    });

    // Notify soldier: spot was taken
    try {
      const soldierId = match.soldier_id
        ?? (await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get()).data()?.soldier_id;
      if (soldierId) {
        await createNotification(
          soldierId, "soldier",
          `המקום אצל משפחת ${match.family_name ?? "המשפחה"} נתפס. אנחנו מחפשים לך משפחה חדשה!`,
          "spot_taken",
          "המקום נתפס — מחפשים לך חלופה",
          { request_id: match.soldier_request_id }
        );
      }
    } catch (e) { console.error("notification error (spot_taken scheduler):", e); }

    await tryAllCompromiseLevels(match.soldier_request_id);
  }

  // ── REMINDER A: soldier hasn't confirmed in 24h ───────────────────
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const unconfirmedSnap = await db.collection("active_matches")
    .where("status", "==", "pending_soldier_approval")
    .get();

  for (const matchDoc of unconfirmedSnap.docs) {
    const match = matchDoc.data();
    if (!match.created_at || match.created_at > oneDayAgo) continue;
    if ((match.reminders_sent ?? []).includes("confirm_24h")) continue;
    if (match.hosting_date && match.hosting_date < todayStr) continue;

    const soldierId = match.soldier_id
      ?? (await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get()).data()?.soldier_id;
    if (!soldierId) continue;

    try {
      await createNotification(
        soldierId, "soldier",
        `נמצאה לך משפחה מארחת: ${match.family_name ?? "משפחה"} ב${match.family_city ?? ""}. עדיין לא אישרת הגעה — אנא אשר בהקדם כדי שלא תאבד את המקום!`,
        "confirm_reminder",
        "תזכורת: עדיין לא אישרת הגעה",
        { request_id: match.soldier_request_id }
      );
      await matchDoc.ref.update({ reminders_sent: FieldValue.arrayUnion("confirm_24h") });
    } catch (e) { console.error("notification error (confirm_24h):", e); }
  }

  // ── REMINDER B: soldier meal details 12h before confirmed hosting ─
  const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const confirmedMatchesSnap = await db.collection("active_matches")
    .where("status", "==", "approved")
    .where("hosting_date", "in", [todayStr, tomorrowStr])
    .get();

  for (const matchDoc of confirmedMatchesSnap.docs) {
    const match = matchDoc.data();
    if ((match.reminders_sent ?? []).includes("meal_12h")) continue;
    if (!match.host_offer_id) continue;

    // Fetch hosting to get the time
    const hostingSnap = await db.collection("family_hostings").doc(match.host_offer_id).get();
    if (!hostingSnap.exists) continue;
    const hosting = hostingSnap.data();
    if (hosting.status === "canceled") continue;

    const hostingTime = hosting.time ?? "18:00";
    const hostingDatetime = new Date(`${match.hosting_date}T${hostingTime}:00`);
    const msUntil = hostingDatetime - now;
    if (msUntil > 12 * 60 * 60 * 1000 || msUntil < 0) continue;

    // Fetch family to get address
    const familySnap = await db.collection("families").doc(match.family_id).get();
    const family = familySnap.exists ? familySnap.data() : {};
    const address = family.hostAddress || family.hostCity || "";

    const soldierId = match.soldier_id
      ?? (await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get()).data()?.soldier_id;
    if (!soldierId) continue;

    try {
      await createNotification(
        soldierId, "soldier",
        `יש לך אירוח היום בשעה ${hostingTime} אצל משפחת ${match.family_name ?? "המשפחה"}${address ? ` בכתובת ${address}` : ""}. שבת שלום!`,
        "meal_reminder",
        "תזכורת לאירוח הערב 🍽️",
        { request_id: match.soldier_request_id }
      );
      await matchDoc.ref.update({ reminders_sent: FieldValue.arrayUnion("meal_12h") });
    } catch (e) { console.error("notification error (meal_12h):", e); }
  }

  // ── REMINDER C: family guest details 12h before hosting ──────────
  const familyHostingsFor12hSnap = await db.collection("family_hostings")
    .where("date", "in", [todayStr, tomorrowStr])
    .get();

  for (const hostingDoc of familyHostingsFor12hSnap.docs) {
    const hosting = hostingDoc.data();
    if (hosting.status === "canceled") continue;
    if (!hosting.guests || hosting.guests.length === 0) continue;
    if ((hosting.reminders_sent ?? []).includes("guest_details_12h")) continue;

    const hostingTime = hosting.time ?? "18:00";
    const hostingDatetime = new Date(`${hosting.date}T${hostingTime}:00`);
    const msUntil = hostingDatetime - now;
    if (msUntil > 12 * 60 * 60 * 1000 || msUntil < 0) continue;

    const guestCount = hosting.guests.reduce((s, g) => s + (g.groupSize || 1), 0);
    const guestNames = hosting.guests.map(g => g.name).filter(Boolean).join(", ");

    try {
      await createNotification(
        hosting.family_id, "host",
        `תזכורת 🗓️ ${guestCount} חייל/ים צפויים להגיע אליכם היום בשעה ${hostingTime}: ${guestNames}. שבת שלום ומבורכת!`,
        "guest_details_reminder",
        "פרטי החיילים המגיעים אליכם היום",
        { hosting_id: hostingDoc.id }
      );
      await hostingDoc.ref.update({ reminders_sent: FieldValue.arrayUnion("guest_details_12h") });
    } catch (e) { console.error("notification error (guest_details_12h):", e); }
  }

  // ── REMINDER E: family hosting 18h away with no confirmed guests ──
  const eigteenHoursFromNow = new Date(now.getTime() + 18 * 60 * 60 * 1000);
  const upcomingHostingsSnap = await db.collection("family_hostings")
    .where("date", "in", [todayStr, tomorrowStr])
    .get();

  for (const hostingDoc of upcomingHostingsSnap.docs) {
    const hosting = hostingDoc.data();
    if (hosting.status === "canceled") continue;
    if (hosting.guests && hosting.guests.length > 0) continue;
    if ((hosting.reminders_sent ?? []).includes("no_guests_18h")) continue;

    const hostingTime = hosting.time ?? "18:00";
    const hostingDatetime = new Date(`${hosting.date}T${hostingTime}:00`);
    const msUntil = hostingDatetime - now;
    if (msUntil > 18 * 60 * 60 * 1000 || msUntil < 0) continue;

    try {
      await createNotification(
        hosting.family_id, "host",
        `האירוח שלך ב${hosting.date} מתקרב ועדיין אין חיילים מאושרים. האם תרצו לשנות משהו בהגדרות כדי שנוכל לשבץ אליכם חיילים?`,
        "no_guests_reminder",
        "עדיין אין חיילים לאירוח שלך",
        { hosting_id: hostingDoc.id }
      );
      await hostingDoc.ref.update({ reminders_sent: FieldValue.arrayUnion("no_guests_18h") });
    } catch (e) { console.error("notification error (no_guests_18h):", e); }
  }

  // ── REMINDER F: unmatched soldier 25h before event ────────────────
  const twentyFiveHoursDate = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString().split("T")[0];
  const checkDates = [...new Set([todayStr, tomorrowStr, twentyFiveHoursDate])];

  const unmatchedSoldiersSnap = await db.collection("soldier_hosting_searches")
    .where("is_match", "==", false)
    .where("when", "in", checkDates)
    .get();

  for (const reqDoc of unmatchedSoldiersSnap.docs) {
    const req = reqDoc.data();
    if ((req.reminders_sent ?? []).includes("unmatched_25h")) continue;

    const eventDatetime = new Date(`${req.when}T18:00:00`);
    const hoursUntil = (eventDatetime - now) / (60 * 60 * 1000);
    if (hoursUntil > 25 || hoursUntil < 0) continue;

    try {
      await createNotification(
        req.soldier_id, "soldier",
        "עדיין מחפשים לך משפחה מארחת לשבת הקרובה. אנחנו ממשיכים לנסות ולא שכחנו אותך! 💪",
        "searching_reminder",
        "עדיין מחפשים לך משפחה",
        { request_id: reqDoc.id }
      );
      await reqDoc.ref.update({ reminders_sent: FieldValue.arrayUnion("unmatched_25h") });
    } catch (e) { console.error("notification error (unmatched_25h):", e); }
  }
});

// ──────────────────────────────────────────────────────────────────
// CALLABLE: soldier requests a rematch
// Call with: { match_id, is_permanent }
// is_permanent=true  → add family to soldier's permanent ban list
// is_permanent=false → add family to this request's temporary ban list
// ──────────────────────────────────────────────────────────────────
exports.requestRematch = onCall(async (req) => {
  const { match_id, is_permanent } = req.data;
  if (!match_id) throw new HttpsError("invalid-argument", "match_id is required");

  const matchSnap = await db.collection("active_matches").doc(match_id).get();
  if (!matchSnap.exists) throw new HttpsError("not-found", "Match not found");
  const match = matchSnap.data();

  // Archive the rejected match (move out of active_matches)
  await db.collection("active_match_archive").doc(match_id).set({
    ...match,
    final_status: "canceled_by_soldier",
    archived_at: new Date().toISOString(),
  });
  await db.collection("active_matches").doc(match_id).delete();

  // If the match was already confirmed, notify family, free seats, and fill the slot
  if (match.status === "approved" && match.host_offer_id) {
    // Notify family: their confirmed soldier changed plans
    try {
      if (match.family_id) {
        await createNotification(
          match.family_id, "host",
          `חייל שאישר הגעה לאירוח שלך ב${match.hosting_date ?? ""} שינה את תוכניותיו ולא יוכל להגיע. אנחנו נעדכן אותך אם יגיע חייל אחר.`,
          "soldier_canceled",
          "חייל ביטל הגעה",
          { hosting_id: match.host_offer_id }
        );
      }
    } catch (e) { console.error("notification error (rematch_family):", e); }

    const hostingRef = db.collection("family_hostings").doc(match.host_offer_id);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(hostingRef);
      if (!snap.exists) return;
      const d = snap.data();
      const updatedGuests = (d.guests || []).filter((g) => g.match_id !== match_id);
      const newTotal = updatedGuests.reduce((s, g) => s + (g.groupSize || 1), 0);
      const capacity = parseInt(d.soldiers) || 0;
      tx.update(hostingRef, {
        guests: updatedGuests,
        is_fully_booked: capacity > 0 && newTotal >= capacity,
      });
    });

    // Slot is now free — scan for other unmatched soldiers on the same date.
    // The canceling soldier's is_match is still true here so they won't be picked up;
    // they get their own rematch attempt below via tryAllCompromiseLevels.
    if (match.hosting_date) {
      const unmatchedSnap = await db
        .collection("soldier_hosting_searches")
        .where("when", "==", match.hosting_date)
        .where("is_match", "==", false)
        .get();
      for (const doc of unmatchedSnap.docs) {
        await runMatchingForRequest(doc.id, COMPROMISE.NONE);
      }
    }
  }

  // Load the soldier request
  const requestSnap = await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get();
  const request = requestSnap.data();

  if (is_permanent) {
    // Add to soldier's permanent ban list
    const soldierSnap = await db.collection("soldiers").doc(request.soldier_id).get();
    const currentBanned = soldierSnap.data()?.banned_families ?? [];
    await db.collection("soldiers").doc(request.soldier_id).update({
      banned_families: [...currentBanned, match.family_id],
    });
  } else {
    // Add to this request's temporary ban list only
    await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
      temporarily_banned_families: [
        ...(request.temporarily_banned_families ?? []),
        match.family_id,
      ],
    });
  }

  // Reopen the request for matching
  await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
    is_match: false,
  });

  // Re-run the matching algorithm (all compromise levels)
  const newMatch = await tryAllCompromiseLevels(match.soldier_request_id);

  return newMatch
    ? { success: true, new_match: newMatch }
    : { success: true, new_match: null, message: "לא נמצאה התאמה חלופית כרגע, נמשיך לחפש" };
});

// ──────────────────────────────────────────────────────────────────
// CALLABLE: one-time migration — unify kosher & shabbat values
//
// Unified schema (same values for soldiers AND families):
//   kosher:  "none" | "separated" | "mehadrin"
//   shabbat: "none" | "traditional" | "keeps"
//
// Call once after deploy.  Safe to call again — already-migrated
// docs are detected and skipped.
// ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────
// CALLABLE: debug matching for a soldier request — returns a detailed
// report of every family hosting checked and which filter blocked it.
// Does NOT create a match. Call with: { request_id }
// ──────────────────────────────────────────────────────────────────
exports.debugMatching = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { request_id } = req.data;
  if (!request_id) throw new HttpsError("invalid-argument", "request_id is required");

  const requestSnap = await db.collection("soldier_hosting_searches").doc(request_id).get();
  if (!requestSnap.exists) throw new HttpsError("not-found", "Request not found");
  const request = requestSnap.data();

  const soldierSnap = await db.collection("soldiers").doc(request.soldier_id).get();
  if (!soldierSnap.exists) throw new HttpsError("not-found", "Soldier not found");
  const soldier = soldierSnap.data();

  const bannedIds = new Set([
    ...(soldier.banned_families ?? []),
    ...(request.temporarily_banned_families ?? []),
  ]);

  const hostingsSnap = await db
    .collection("family_hostings")
    .where("date", "==", request.when)
    .where("is_fully_booked", "==", false)
    .get();

  const ALLERGY_TO_COOKING = { gluten: "celiac", vegetarian: "veg" };
  const UNMATCHABLE = new Set(["peanuts", "fish", "other"]);
  const soldierAllergies = (soldier.allergies ?? [])
    .filter((a) => !UNMATCHABLE.has(a))
    .map((a) => ALLERGY_TO_COOKING[a] ?? a);

  const report = {
    request: {
      id: request_id,
      when: request.when,
      kosher: request.kosher,
      shabbat: request.shabbat,
      guestCount: request.guestCount ?? 1,
      startTime: request.startTime,
      endTime: request.endTime,
      travelDistance: request.travelDistance,
      petsComfort: request.petsComfort,
      needSleep: request.needSleep,
      transport: request.transport,
      is_match: request.is_match,
    },
    soldier: {
      id: request.soldier_id,
      allergies: soldier.allergies,
      pets: soldier.pets,
      languages: soldier.languages,
    },
    hostings_found: hostingsSnap.size,
    families: [],
  };

  for (const hostingDoc of hostingsSnap.docs) {
    const hosting = hostingDoc.data();
    const familySnap = await db.collection("families").doc(hosting.family_id).get();
    const family = familySnap.exists ? familySnap.data() : {};

    const checks = {};

    checks.banned = bannedIds.has(hosting.family_id);
    checks.capacity = (parseInt(hosting.soldiers) || 0) >= (request.guestCount ?? 1);
    checks.status_not_canceled = hosting.status !== "canceled";
    checks.shabbat = isShabbatCompatible(request.shabbat, family.hostShabbat);
    checks.kosher = (request.kosher === "none" || !request.kosher)
      ? true
      : isKosherCompatible(request.kosher, family.hostKosher);
    checks.allergies = !soldierAllergies.some((a) => !(family.hostCooking ?? []).includes(a));
    checks.sleep = request.needSleep === true ? hosting.sleepOvernight === true : true;
    checks.pet_allergy = !(soldier.pets === "allergy" && family.hasPets === true);
    checks.pets_comfort = request.petsComfort !== "no" || family.hasPets !== true;
    checks.time = isTimeCompatible(request.startTime, request.endTime, hosting.time, 0);
    checks.time_compromise = isTimeCompatible(request.startTime, request.endTime, hosting.time, 120);

    // Geographic radius (straight-line estimate; the real engine refines this
    // with Google Distance Matrix). Unknown distance → treated as passing.
    const distanceKm =
      isNum(request.lat) && isNum(request.lng) && isNum(family.hostLat) && isNum(family.hostLng)
        ? haversineKm(request.lat, request.lng, family.hostLat, family.hostLng)
        : null;
    const radiusKm = isNum(request.travelDistance) ? request.travelDistance : DEFAULT_RADIUS_KM;
    checks.within_radius = distanceKm === null ? true : distanceKm <= radiusKm;

    // "banned" is inverted: false = not banned = passes. All other checks: true = passes.
    const failedStrict = Object.entries(checks)
      .filter(([k, v]) => k !== "time_compromise" && (k === "banned" ? v === true : v === false))
      .map(([k]) => k);

    const failedWithCompromise = Object.entries(checks)
      .filter(([k, v]) => (k === "banned" ? v === true : v === false))
      .map(([k]) => k);

    const passes = failedStrict.length === 0 ||
      (failedStrict.length === 1 && failedStrict[0] === "time" && checks.time_compromise) ||
      (failedStrict.length === 1 && failedStrict[0] === "pets_comfort");

    report.families.push({
      hosting_id: hostingDoc.id,
      family_id: hosting.family_id,
      family_name: family.hostName ?? "?",
      hosting_date: hosting.date,
      hosting_time: hosting.time,
      hosting_soldiers: hosting.soldiers,
      hosting_status: hosting.status,
      family_kosher: family.hostKosher,
      family_shabbat: family.hostShabbat,
      family_hasPets: family.hasPets,
      family_cooking: family.hostCooking,
      family_languages: family.hostLanguages,
      distance_km: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
      checks,
      failed_strict: failedStrict,
      failed_with_compromise: failedWithCompromise,
      would_pass: passes,
    });
  }

  return report;
});

exports.migrateValues = onCall(async (req) => {
  // Only allow signed-in users (add uid check here if you want admin-only)
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const KOSHER_REMAP  = { kosher: "separated", kitchen: "mehadrin" };
  const SHABBAT_REMAP = { yes: "keeps", no: "none", observant: "keeps", secular: "none" };

  const stats = { soldiers: 0, families: 0, requests: 0 };

  // ── 1. soldiers ────────────────────────────────────────────────
  const soldiersSnap = await db.collection("soldiers").get();
  const soldierLevels = {};   // uid → { kosher, shabbatKeeps } after migration

  for (const doc of soldiersSnap.docs) {
    const d = doc.data();
    const patch = {};

    const newKosher  = KOSHER_REMAP[d.kosher]       ?? d.kosher;
    const newShabbat = SHABBAT_REMAP[d.shabbatKeeps] ?? d.shabbatKeeps;

    if (newKosher  !== d.kosher)       patch.kosher       = newKosher;
    if (newShabbat !== d.shabbatKeeps) patch.shabbatKeeps = newShabbat;

    soldierLevels[doc.id] = {
      kosher:      newKosher  || "none",
      shabbatKeeps: newShabbat || "none",
    };

    if (Object.keys(patch).length > 0) {
      await doc.ref.update(patch);
      stats.soldiers++;
    }
  }

  // ── 2. families ────────────────────────────────────────────────
  const familiesSnap = await db.collection("families").get();
  for (const doc of familiesSnap.docs) {
    const d = doc.data();
    const newKosher = KOSHER_REMAP[d.hostKosher] ?? d.hostKosher;

    if (newKosher !== d.hostKosher) {
      await doc.ref.update({ hostKosher: newKosher });
      stats.families++;
    }
    // hostShabbat already uses none/traditional/keeps — no change needed
  }

  // ── 3. soldier_hosting_searches ────────────────────────────────
  // kosher & shabbat were stored as booleans; convert to string levels
  const requestsSnap = await db.collection("soldier_hosting_searches").get();
  for (const doc of requestsSnap.docs) {
    const d = doc.data();
    const patch = {};
    const soldier = soldierLevels[d.soldier_id] ?? {};

    // kosher: boolean true → soldier's level, false → "none"
    if (typeof d.kosher === "boolean") {
      patch.kosher = d.kosher ? (soldier.kosher || "separated") : "none";
    } else if (KOSHER_REMAP[d.kosher]) {
      patch.kosher = KOSHER_REMAP[d.kosher];
    }

    // shabbat: boolean true → soldier's shabbat level, false → "none"
    if (typeof d.shabbat === "boolean") {
      patch.shabbat = d.shabbat ? (soldier.shabbatKeeps || "keeps") : "none";
    } else if (SHABBAT_REMAP[d.shabbat]) {
      patch.shabbat = SHABBAT_REMAP[d.shabbat];
    }

    if (Object.keys(patch).length > 0) {
      await doc.ref.update(patch);
      stats.requests++;
    }
  }

  return {
    success: true,
    updated: stats,
    message: `עודכנו: ${stats.soldiers} חיילים, ${stats.families} משפחות, ${stats.requests} בקשות`,
  };
});

// ──────────────────────────────────────────────────────────────────
// CALLABLE: soldier confirms arrival
// Just marks the match as "approved". The onActiveMatchApproved
// trigger below handles guest list update and capacity checks.
// ──────────────────────────────────────────────────────────────────
exports.confirmMatch = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { match_id } = req.data;
  if (!match_id) throw new HttpsError("invalid-argument", "match_id is required");

  const matchSnap = await db.collection("active_matches").doc(match_id).get();
  if (!matchSnap.exists) throw new HttpsError("not-found", "Match not found");
  const match = matchSnap.data();

  if (match.status === "approved") return { success: true, already_confirmed: true };
  if (match.status !== "pending_soldier_approval") {
    return { success: false, message: "Match is no longer active" };
  }

  await db.collection("active_matches").doc(match_id).update({ status: "approved" });
  return { success: true };
});

// ──────────────────────────────────────────────────────────────────
// TRIGGER: match approved → add guest + check capacity for others
//
// Fires when status changes pending_soldier_approval → approved.
//   1. Add this soldier to family_hostings.guests (with capacity check).
//      If no space (someone else confirmed first) → archive this match
//      as "no_room", reopen soldier's request, rematch.
//   2. Check all remaining pending matches for the same hosting.
//      Space available → leave pending (soldier can still confirm).
//      No space → archive as "no_room", reopen, rematch.
// ──────────────────────────────────────────────────────────────────
exports.onActiveMatchApproved = onDocumentUpdated(
  { document: "active_matches/{matchId}", region: "me-west1" },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    if (before.status !== "pending_soldier_approval" || after.status !== "approved") return;

    const matchId = event.params.matchId;
    if (!after.host_offer_id) return;

    // Build guest object from soldier + request docs
    const requestSnap = await db.collection("soldier_hosting_searches").doc(after.soldier_request_id).get();
    const request = requestSnap.exists ? requestSnap.data() : {};
    const soldierSnap = await db.collection("soldiers").doc(request.soldier_id).get();
    const soldier = soldierSnap.exists ? soldierSnap.data() : {};
    const guestObj = {
      match_id:       matchId,
      soldier_id:     request.soldier_id ?? null,
      name:           soldier.fullName ?? soldier.name ?? "חייל",
      phone:          soldier.phone ?? null,
      unit:           soldier.unit ?? null,
      age:            soldier.age ?? null,
      avatarColor:    soldier.avatarPreview ?? "#6f8f72",
      kosher:         request.kosher ?? "none",
      allergies:      soldier.allergies ?? [],
      bio:            soldier.bio ?? null,
      needSleep:      request.needSleep ?? false,
      needsTransport: request.transport ?? false,
      walkDistance:   request.walkDistance ?? false,
      groupSize:      after.group_size ?? request.guestCount ?? 1,
    };

    // 1. Add guest transactionally with a capacity check
    const result = { added: false, full: false };
    const hostingRef = db.collection("family_hostings").doc(after.host_offer_id);

    await db.runTransaction(async (tx) => {
      result.added = false;
      result.full = false;
      const snap = await tx.get(hostingRef);
      if (!snap.exists) return;
      const d = snap.data();
      const existingGuests = d.guests || [];

      if (existingGuests.some((g) => g.match_id === matchId)) {
        result.added = true;
        result.full = !!d.is_fully_booked;
        return;
      }

      const capacity = parseInt(d.soldiers) || 0;
      const currentTotal = existingGuests.reduce((s, g) => s + (g.groupSize || 1), 0);
      const guestSize = guestObj.groupSize || 1;

      if (capacity > 0 && currentTotal + guestSize > capacity) return; // no space

      const updatedGuests = [...existingGuests, guestObj];
      const newTotal = currentTotal + guestSize;
      result.added = true;
      result.full = capacity > 0 && newTotal >= capacity;
      tx.update(hostingRef, { guests: updatedGuests, is_fully_booked: result.full });
    });

    if (!result.added) {
      // Someone else confirmed first — archive this match and rematch
      await db.collection("active_match_archive").doc(matchId).set({
        ...after,
        final_status: "no_room",
        archived_at: new Date().toISOString(),
      });
      await db.collection("active_matches").doc(matchId).delete();
      await db.collection("soldier_hosting_searches").doc(after.soldier_request_id).update({
        is_match: false,
        notification: "no_spot_left",
      });

      // Notify soldier: spot was taken by someone faster
      try {
        await createNotification(
          request.soldier_id, "soldier",
          `המקום אצל משפחת ${after.family_name ?? "המשפחה"} נתפס על ידי חייל אחר שאישר מהר יותר. אנחנו מחפשים לך משפחה חדשה!`,
          "spot_taken",
          "המקום נתפס — מחפשים לך חלופה",
          { request_id: after.soldier_request_id }
        );
      } catch (e) { console.error("notification error (spot_taken):", e); }

      await tryAllCompromiseLevels(after.soldier_request_id);
      return;
    }

    // Notify family: a soldier confirmed arrival
    try {
      if (after.family_id) {
        const groupLabel = (after.group_size ?? 1) > 1 ? ` (${after.group_size} חיילים)` : "";
        await createNotification(
          after.family_id, "host",
          `${guestObj.name}${groupLabel} אישר הגעה לאירוח שלך ב${after.hosting_date ?? ""}. תוכלו לראות את הפרטים המלאים בדשבורד.`,
          "soldier_confirmed",
          "חייל אישר הגעה!",
          { hosting_id: after.host_offer_id }
        );
      }
    } catch (e) { console.error("notification error (soldier_confirmed):", e); }

    // 2. Check all remaining pending matches for this hosting
    const pendingSnap = await db
      .collection("active_matches")
      .where("host_offer_id", "==", after.host_offer_id)
      .where("status", "==", "pending_soldier_approval")
      .get();

    if (pendingSnap.empty) return;

    const hostingSnap = await db.collection("family_hostings").doc(after.host_offer_id).get();
    const hosting = hostingSnap.exists ? hostingSnap.data() : {};
    const capacity = parseInt(hosting.soldiers) || 0;
    const confirmedTotal = (hosting.guests || []).reduce((s, g) => s + (g.groupSize || 1), 0);
    let available = capacity - confirmedTotal;

    for (const pendingDoc of pendingSnap.docs) {
      const pendingMatch = pendingDoc.data();
      const pendingSize = pendingMatch.group_size ?? 1;

      if (available >= pendingSize) {
        available -= pendingSize; // space exists — leave pending
        continue;
      }

      // No space for this soldier — archive and rematch
      await db.collection("active_match_archive").doc(pendingDoc.id).set({
        ...pendingMatch,
        final_status: "no_room",
        archived_at: new Date().toISOString(),
      });
      await pendingDoc.ref.delete();
      await db.collection("soldier_hosting_searches").doc(pendingMatch.soldier_request_id).update({
        is_match: false,
        notification: "no_spot_left",
      });
      await tryAllCompromiseLevels(pendingMatch.soldier_request_id);
    }
  }
);

// ──────────────────────────────────────────────────────────────────
// CALLABLE: trigger matching for all unmatched soldiers on a given date
// Called after a hosting is restored so soldiers are matched immediately.
// Call with: { date } — e.g. "2026-06-06"
// ──────────────────────────────────────────────────────────────────
exports.triggerMatchingForDate = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { date } = req.data;
  if (!date) throw new HttpsError("invalid-argument", "date is required");

  const unmatchedSnap = await db
    .collection("soldier_hosting_searches")
    .where("when", "==", date)
    .where("is_match", "==", false)
    .get();

  let matched = 0;
  for (const doc of unmatchedSnap.docs) {
    const result = await tryAllCompromiseLevels(doc.id);
    if (result) matched++;
  }

  return { success: true, scanned: unmatchedSnap.size, matched };
});

// ──────────────────────────────────────────────────────────────────
// CALLABLE: soldier cancels their own request
// Call with: { request_id }
//   - Archives any active match (freed slot → scan for replacement soldier)
//   - Archives the soldier_hosting_searches doc itself
// ──────────────────────────────────────────────────────────────────
exports.cancelSoldierRequest = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { request_id } = req.data;
  if (!request_id) throw new HttpsError("invalid-argument", "request_id is required");

  const requestSnap = await db.collection("soldier_hosting_searches").doc(request_id).get();
  if (!requestSnap.exists) throw new HttpsError("not-found", "Request not found");
  const request = requestSnap.data();

  // 1. Find and archive any active match for this request
  const matchesSnap = await db
    .collection("active_matches")
    .where("soldier_request_id", "==", request_id)
    .get();

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data();
    if (!["pending_soldier_approval", "approved"].includes(match.status)) continue;

    // Archive the match
    await db.collection("active_match_archive").doc(matchDoc.id).set({
      ...match,
      final_status: "canceled_by_soldier",
      archived_at: new Date().toISOString(),
    });
    await matchDoc.ref.delete();

    // If already confirmed, free the hosting slot, notify family, and scan for a replacement
    if (match.status === "approved" && match.host_offer_id) {
      // Notify family: their confirmed soldier canceled
      try {
        if (match.family_id) {
          await createNotification(
            match.family_id, "host",
            `חייל שאישר הגעה לאירוח שלך ב${match.hosting_date ?? ""} ביטל את ההגעה. אנחנו נעדכן אותך אם יגיע חייל אחר במקומו.`,
            "soldier_canceled",
            "חייל ביטל הגעה",
            { hosting_id: match.host_offer_id }
          );
        }
      } catch (e) { console.error("notification error (soldier_canceled):", e); }

      const hostingRef = db.collection("family_hostings").doc(match.host_offer_id);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(hostingRef);
        if (!snap.exists) return;
        const d = snap.data();
        const updatedGuests = (d.guests || []).filter((g) => g.match_id !== matchDoc.id);
        const newTotal = updatedGuests.reduce((s, g) => s + (g.groupSize || 1), 0);
        const capacity = parseInt(d.soldiers) || 0;
        tx.update(hostingRef, {
          guests: updatedGuests,
          is_fully_booked: capacity > 0 && newTotal >= capacity,
        });
      });

      if (match.hosting_date) {
        const unmatchedSnap = await db
          .collection("soldier_hosting_searches")
          .where("when", "==", match.hosting_date)
          .where("is_match", "==", false)
          .get();
        for (const doc of unmatchedSnap.docs) {
          await runMatchingForRequest(doc.id, COMPROMISE.NONE);
        }
      }
    }
  }

  // 2. Archive the soldier request itself
  await db.collection("soldier_hosting_searches_archive").doc(request_id).set({
    ...request,
    status: "canceled",
    final_status: "canceled_by_soldier",
    archived_at: new Date().toISOString(),
  });
  await db.collection("soldier_hosting_searches").doc(request_id).delete();

  return { success: true };
});

// ──────────────────────────────────────────────────────────────────
// CALLABLE: family cancels a hosting → rematch all affected soldiers
// Call with: { hosting_id }
// ──────────────────────────────────────────────────────────────────
exports.cancelHosting = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { hosting_id } = req.data;
  if (!hosting_id) throw new HttpsError("invalid-argument", "hosting_id is required");

  // 1. Read the hosting before deleting it
  const hostingSnap = await db.collection("family_hostings").doc(hosting_id).get();
  if (!hostingSnap.exists) throw new HttpsError("not-found", "Hosting not found");
  const hostingData = hostingSnap.data();

  // 2. Find all active matches for this hosting
  const matchesSnap = await db
    .collection("active_matches")
    .where("host_offer_id", "==", hosting_id)
    .where("status", "in", ["pending_soldier_approval", "approved"])
    .get();

  const rematchResults = [];

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data();

    // 3. Archive the match
    await db.collection("active_match_archive").doc(matchDoc.id).set({
      ...match,
      final_status: "canceled_by_host",
      archived_at: new Date().toISOString(),
    });
    await matchDoc.ref.delete();

    // 4. Reopen soldier's request for matching
    await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
      is_match: false,
    });

    // Notify soldier: their hosting was canceled — we're looking for a new one
    try {
      const soldierIdForNotif = match.soldier_id
        ?? (await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get()).data()?.soldier_id;
      if (soldierIdForNotif) {
        await createNotification(
          soldierIdForNotif, "soldier",
          `האירוח שנקצה לך ב${match.hosting_date ?? ""} בוטל על ידי המשפחה. אנחנו כבר מחפשים לך משפחה חדשה!`,
          "hosting_canceled",
          "האירוח בוטל — מחפשים לך חלופה",
          { request_id: match.soldier_request_id }
        );
      }
    } catch (e) { console.error("notification error (hosting_canceled):", e); }

    // 5. Try to find a new match
    const newMatch = await tryAllCompromiseLevels(match.soldier_request_id);
    rematchResults.push({
      soldier_request_id: match.soldier_request_id,
      new_match: newMatch ? newMatch.match_id : null,
    });
  }

  // 6. Archive the hosting itself
  await db.collection("family_hostings_archive").doc(hosting_id).set({
    ...hostingData,
    status: "canceled",
    final_status: "canceled",
    archived_at: new Date().toISOString(),
  });
  await db.collection("family_hostings").doc(hosting_id).delete();

  return {
    success: true,
    affected_soldiers: matchesSnap.size,
    rematch_results: rematchResults,
  };
});

// ──────────────────────────────────────────────────────────────────
// TRIGGER: family cancels a hosting → rematch all affected soldiers
// (backup trigger in case the callable is not used)
//
// Flow:
//   1. Detect status change to "canceled"
//   2. For every active match on that hosting:
//      a. Mark match as "canceled_by_host"
//      b. Reopen the soldier's request (is_match → false)
//      c. Temporarily ban this family so the soldier isn't re-matched with them
//   3. Run the matching algorithm for each affected soldier
// ──────────────────────────────────────────────────────────────────
exports.onHostingStatusChange = onDocumentUpdated(
  { document: "family_hostings/{hostingId}", region: "me-west1" },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    if (before.status === after.status) return;

    const hostingId = event.params.hostingId;

    // ── CANCELED → rematch affected soldiers ──────────────────────
    if (after.status === "canceled") {
      console.log("🔔 Hosting canceled:", hostingId);

      const matchesSnap = await db
        .collection("active_matches")
        .where("host_offer_id", "==", hostingId)
        .where("status", "in", ["pending_soldier_approval", "approved"])
        .get();

      for (const matchDoc of matchesSnap.docs) {
        const match = matchDoc.data();
        await db.collection("active_match_archive").doc(matchDoc.id).set({
          ...match,
          final_status: "canceled_by_host",
          archived_at: new Date().toISOString(),
        });
        await matchDoc.ref.delete();
        await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
          is_match: false,
        });

        // Notify soldier: hosting canceled — looking for a new one
        try {
          const soldierIdForNotif = match.soldier_id
            ?? (await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).get()).data()?.soldier_id;
          if (soldierIdForNotif) {
            await createNotification(
              soldierIdForNotif, "soldier",
              `האירוח שנקצה לך ב${match.hosting_date ?? ""} בוטל על ידי המשפחה. אנחנו כבר מחפשים לך משפחה חדשה!`,
              "hosting_canceled",
              "האירוח בוטל — מחפשים לך חלופה",
              { request_id: match.soldier_request_id }
            );
          }
        } catch (e) { console.error("notification error (hosting_canceled trigger):", e); }

        await tryAllCompromiseLevels(match.soldier_request_id);
      }
    }

    // ── RESTORED → scan all waiting soldiers for this date ────────
    if (before.status === "canceled" && after.status === "open") {
      console.log("🔔 Hosting restored:", hostingId);

      const unmatchedSnap = await db
        .collection("soldier_hosting_searches")
        .where("when", "==", after.date)
        .where("is_match", "==", false)
        .get();

      console.log(`🔍 Scanning ${unmatchedSnap.size} unmatched request(s)`);

      for (const doc of unmatchedSnap.docs) {
        await runMatchingForRequest(doc.id, COMPROMISE.NONE);
      }
    }
  }
);

// ──────────────────────────────────────────────────────────────────
// SCHEDULED DAILY: archive all documents whose date has passed
//
// Sweeps 3 live collections:
//   family_hostings          → family_hostings_archive
//   soldier_hosting_searches → soldier_hosting_searches_archive
//   active_matches           → active_match_archive
//
// final_status values:
//   done              — meal happened (approved match, or hosting/request with a match)
//   expired           — date passed with no match / no confirmation
//   canceled          — family canceled the hosting
//   canceled_by_host  — match canceled by the host (already handled inline, caught here as safety net)
//   canceled_by_soldier — match rejected by soldier (same)
// ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────
// CALLABLE: family restores a previously canceled hosting
// Moves the doc back from family_hostings_archive → family_hostings,
// resets to a clean open state, and triggers matching.
// Call with: { hosting_id }
// ──────────────────────────────────────────────────────────────────
exports.restoreHosting = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { hosting_id } = req.data;
  if (!hosting_id) throw new HttpsError("invalid-argument", "hosting_id is required");

  const archiveSnap = await db.collection("family_hostings_archive").doc(hosting_id).get();
  if (!archiveSnap.exists) throw new HttpsError("not-found", "Archived hosting not found");

  const { final_status, archived_at, ...hostingData } = archiveSnap.data();

  // Restore to active collection with clean state
  await db.collection("family_hostings").doc(hosting_id).set({
    ...hostingData,
    status: "open",
    guests: [],
    occupied: 0,
    is_fully_booked: false,
  });

  // Remove from archive
  await db.collection("family_hostings_archive").doc(hosting_id).delete();

  // Matching is triggered automatically by onNewFamilyHosting (document creation above)
  // so we don't scan here to avoid running the algorithm twice.

  return { success: true, date: hostingData.date };
});

exports.archivePastEvents = onSchedule(
  { schedule: "every 24 hours", region: "me-west1" },
  async () => {
    const today = new Date().toISOString().split("T")[0];
    const archiveAt = new Date().toISOString();
    console.log("📦 archivePastEvents running for dates before", today);

    // ── 1. Archive past family hostings ───────────────────────────
    const hostingsSnap = await db
      .collection("family_hostings")
      .where("date", "<", today)
      .get();

    for (const doc of hostingsSnap.docs) {
      const data = doc.data();
      const finalStatus = data.status === "canceled" ? "canceled" : "done";
      await db.collection("family_hostings_archive").doc(doc.id).set({
        ...data,
        final_status: finalStatus,
        archived_at: archiveAt,
      });
      await doc.ref.delete();
    }
    console.log(`📦 Archived ${hostingsSnap.size} family hosting(s)`);

    // ── 2. Archive past soldier requests ──────────────────────────
    const requestsSnap = await db
      .collection("soldier_hosting_searches")
      .where("when", "<", today)
      .get();

    for (const doc of requestsSnap.docs) {
      const data = doc.data();
      const finalStatus = data.is_match ? "done" : "expired";
      await db.collection("soldier_hosting_searches_archive").doc(doc.id).set({
        ...data,
        final_status: finalStatus,
        archived_at: archiveAt,
      });
      await doc.ref.delete();
    }
    console.log(`📦 Archived ${requestsSnap.size} soldier request(s)`);

    // ── 3. Archive past active matches (safety net) ───────────────
    // Matches that were already canceled/rejected are archived inline by their
    // respective functions. This sweep catches any remaining matches whose
    // hosting date has passed (approved → done, pending → expired).
    const matchesSnap = await db
      .collection("active_matches")
      .where("hosting_date", "<", today)
      .get();

    for (const doc of matchesSnap.docs) {
      const data = doc.data();
      let finalStatus;
      if (data.status === "approved") finalStatus = "done";
      else if (data.status === "pending_soldier_approval") finalStatus = "expired";
      else finalStatus = data.status; // preserve any terminal status not yet archived
      await db.collection("active_match_archive").doc(doc.id).set({
        ...data,
        final_status: finalStatus,
        archived_at: archiveAt,
      });
      await doc.ref.delete();
    }
    console.log(`📦 Archived ${matchesSnap.size} active match(es)`);
  }
);

// ══════════════════════════════════════════════════════════════════
// ADDRESS / GEOCODING PROXIES (used by the AddressPicker component)
//
// The Google Maps key lives only in the GOOGLE_MAPS_API_KEY secret and
// is used here, server-side. The browser only ever talks to these
// callables, so the key is never exposed in client code.
// Requires "Places API (New)" and "Geocoding API" enabled on the project.
// ══════════════════════════════════════════════════════════════════

// Pull street / city / full string out of Geocoding API address_components.
function parseGeocodeResult(result) {
  const comps = result.address_components || [];
  const get = (type) => comps.find((c) => (c.types || []).includes(type));
  const streetNumber = get("street_number")?.long_name || "";
  const route = get("route")?.long_name || "";
  const city =
    get("locality")?.long_name ||
    get("postal_town")?.long_name ||
    get("administrative_area_level_2")?.long_name ||
    "";
  const street = [route, streetNumber].filter(Boolean).join(" ").trim();
  const loc = result.geometry?.location || {};
  return {
    fullString: result.formatted_address || "",
    street,
    city,
    coordinates: { lat: loc.lat, lng: loc.lng },
    placeId: result.place_id || "",
  };
}

// Pull street / city out of Places API (New) addressComponents (different shape).
function parsePlaceDetails(place) {
  const comps = place.addressComponents || [];
  const get = (type) => comps.find((c) => (c.types || []).includes(type));
  const streetNumber = get("street_number")?.longText || "";
  const route = get("route")?.longText || "";
  const city =
    get("locality")?.longText ||
    get("postal_town")?.longText ||
    get("administrative_area_level_2")?.longText ||
    "";
  const street = [route, streetNumber].filter(Boolean).join(" ").trim();
  return {
    fullString: place.formattedAddress || "",
    street,
    city,
    coordinates: { lat: place.location?.latitude, lng: place.location?.longitude },
    placeId: place.id || "",
  };
}

// ── CALLABLE: autocomplete suggestions ────────────────────────────
// Call with: { input, country?, languageCode?, sessionToken? }
exports.placesAutocomplete = onCall(
  { secrets: [GOOGLE_MAPS_API_KEY] },
  async (req) => {
    const { input, country = "IL", languageCode = "he", sessionToken } = req.data || {};
    if (!input || !input.trim()) return { suggestions: [] };

    const body = {
      input,
      includedRegionCodes: [String(country).toLowerCase()],
      languageCode,
    };
    if (sessionToken) body.sessionToken = sessionToken;

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY.value(),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("placesAutocomplete error", res.status, await res.text());
      throw new HttpsError("internal", "Autocomplete request failed");
    }

    const json = await res.json();
    const suggestions = (json.suggestions || [])
      .map((s) => s.placePrediction)
      .filter(Boolean)
      .map((p) => ({
        placeId: p.placeId,
        mainText: p.structuredFormat?.mainText?.text || p.text?.text || "",
        secondaryText: p.structuredFormat?.secondaryText?.text || "",
        description: p.text?.text || "",
      }));

    return { suggestions };
  }
);

// ── CALLABLE: full details for a selected place ───────────────────
// Call with: { placeId, languageCode?, sessionToken? }
exports.placeDetails = onCall(
  { secrets: [GOOGLE_MAPS_API_KEY] },
  async (req) => {
    const { placeId, languageCode = "he", sessionToken } = req.data || {};
    if (!placeId) throw new HttpsError("invalid-argument", "placeId is required");

    const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
    url.searchParams.set("languageCode", languageCode);
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY.value(),
        "X-Goog-FieldMask": "id,location,formattedAddress,addressComponents",
      },
    });

    if (!res.ok) {
      console.error("placeDetails error", res.status, await res.text());
      throw new HttpsError("internal", "Place details request failed");
    }

    return { address: parsePlaceDetails(await res.json()) };
  }
);

// ── CALLABLE: reverse geocode a dragged marker ────────────────────
// Call with: { lat, lng, country?, languageCode? }
exports.reverseGeocode = onCall(
  { secrets: [GOOGLE_MAPS_API_KEY] },
  async (req) => {
    const { lat, lng, country = "IL", languageCode = "he" } = req.data || {};
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new HttpsError("invalid-argument", "lat and lng (numbers) are required");
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("language", languageCode);
    url.searchParams.set("region", String(country).toLowerCase());
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY.value());

    const res = await fetch(url);
    if (!res.ok) {
      console.error("reverseGeocode error", res.status, await res.text());
      throw new HttpsError("internal", "Reverse geocode request failed");
    }

    const json = await res.json();
    // The Geocoding API returns HTTP 200 even on auth/billing errors, with the
    // real outcome in `status`. Surface anything that isn't a success or an
    // empty (but valid) result, so failures don't masquerade as "no address".
    if (json.status && json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      console.error("reverseGeocode google status", json.status, json.error_message);
      throw new HttpsError("internal", `Geocoding failed: ${json.status}`);
    }
    const result = (json.results || [])[0];
    if (!result) {
      // No match — still return the raw coordinates so the caller has something.
      return { address: { fullString: "", street: "", city: "", coordinates: { lat, lng }, placeId: "" } };
    }
    // Geocoding omits geometry.location when reverse geocoding from coords we
    // already have, so keep the requested point.
    const parsed = parseGeocodeResult(result);
    parsed.coordinates = { lat, lng };
    return { address: parsed };
  }
);

// ══════════════════════════════════════════════════════════════════
// TELEGRAM BOT — conversational bot with inline keyboards
// ══════════════════════════════════════════════════════════════════

// ── Telegram API helpers ──────────────────────────────────────────

async function telegramPost(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`Telegram ${method} failed`, res.status, await res.text());
  return res;
}

async function sendTelegramMessage(token, chatId, text, replyMarkup = null) {
  const body = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await telegramPost(token, "sendMessage", body);
}

async function answerCallbackQuery(token, queryId) {
  await telegramPost(token, "answerCallbackQuery", { callback_query_id: queryId });
}

// ── Session helpers ───────────────────────────────────────────────
// Sessions live in `telegram_sessions/{chatId}` and hold the
// current conversation state so the webhook can be stateless.

async function getSession(chatId) {
  const snap = await db.collection("telegram_sessions").doc(String(chatId)).get();
  return snap.exists ? snap.data() : null;
}

async function saveSession(chatId, patch) {
  await db.collection("telegram_sessions").doc(String(chatId)).set(
    { ...patch, updated_at: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function resetSession(chatId) {
  await db.collection("telegram_sessions").doc(String(chatId)).set(
    { state: "idle", temp_data: {}, updated_at: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// ── UI helpers ────────────────────────────────────────────────────

function inlineKeyboard(rows) { return { inline_keyboard: rows }; }
function btn(text, data)      { return { text, callback_data: data }; }

function getNextFridays(n = 4) {
  const fridays = [];
  const d = new Date();
  const daysUntil = (5 - d.getDay() + 7) % 7 || 7; // 5 = Friday
  d.setDate(d.getDate() + daysUntil);
  for (let i = 0; i < n; i++) {
    fridays.push({
      label: `שישי ${d.getDate()}/${d.getMonth() + 1}`,
      value: d.toISOString().split("T")[0],
    });
    d.setDate(d.getDate() + 7);
  }
  return fridays;
}

// ── Main menu ─────────────────────────────────────────────────────

async function showMainMenu(token, chatId, role, name) {
  const greeting = name ? `שלום ${name}! 👋` : "שלום! 👋";
  const keyboard = role === "soldier"
    ? inlineKeyboard([
        [btn("📋 הסטטוס שלי", "menu:status")],
        [btn("🍽️ פתח בקשת אירוח", "menu:new_request")],
        [btn("❓ עזרה", "menu:help")],
      ])
    : inlineKeyboard([
        [btn("👥 מי מגיע אליי?", "menu:guests")],
        [btn("🏠 פתח אירוח חדש", "menu:new_hosting")],
        [btn("❓ עזרה", "menu:help")],
      ]);
  await sendTelegramMessage(token, chatId, `${greeting}\n\nמה תרצה לעשות?`, keyboard);
}

// ── Soldier: status ───────────────────────────────────────────────

async function handleStatus(token, chatId, session) {
  const uid = session.user_id;

  const matchSnap = await db.collection("active_matches")
    .where("soldier_id", "==", uid)
    .where("status", "in", ["pending_soldier_approval", "approved"])
    .limit(1).get();

  if (matchSnap.empty) {
    const reqSnap = await db.collection("soldier_hosting_searches")
      .where("soldier_id", "==", uid).where("is_match", "==", false).limit(1).get();
    const msg = reqSnap.empty
      ? "אין לך בקשות פעילות כרגע."
      : `🔍 <b>מחפשים לך משפחה...</b>\n\nתאריך: ${reqSnap.docs[0].data().when}\nעדיין לא נמצאה התאמה — ממשיכים לנסות!`;
    return sendTelegramMessage(token, chatId, msg,
      inlineKeyboard([[btn("🍽️ פתח בקשה", "menu:new_request"), btn("🔙 תפריט", "menu:main")]]));
  }

  const matchId = matchSnap.docs[0].id;
  const match = matchSnap.docs[0].data();
  const statusLabel = match.status === "approved" ? "✅ מאושר" : "⏳ ממתין לאישורך";
  const text = `<b>השיבוץ שלך:</b>\n\nמשפחה: ${match.family_name ?? "—"}\nעיר: ${match.family_city ?? "—"}\nתאריך: ${match.hosting_date ?? "—"}\nסטטוס: ${statusLabel}`;

  const buttons = [[btn("🔙 תפריט", "menu:main")]];
  if (match.status === "pending_soldier_approval")
    buttons.unshift([btn("✅ אשר הגעה", `confirm:${matchId}`), btn("🔄 שיבוץ חדש", `rematch:${matchId}`)]);

  await sendTelegramMessage(token, chatId, text, inlineKeyboard(buttons));
}

// ── Host: who's coming ────────────────────────────────────────────

async function handleGuests(token, chatId, session) {
  const today = new Date().toISOString().split("T")[0];
  const snap = await db.collection("family_hostings")
    .where("family_id", "==", session.user_id)
    .where("date", ">=", today)
    .where("status", "==", "open")
    .orderBy("date").limit(3).get();

  if (snap.empty) {
    return sendTelegramMessage(token, chatId, "אין לך אירוחים פעילים קרובים.",
      inlineKeyboard([[btn("🏠 פתח אירוח חדש", "menu:new_hosting"), btn("🔙 תפריט", "menu:main")]]));
  }

  for (const doc of snap.docs) {
    const h = doc.data();
    const guests = h.guests || [];
    let text = `🗓️ <b>${h.date}</b> בשעה ${h.time ?? "—"}\n`;
    if (guests.length === 0) {
      text += "עדיין לא שובצו חיילים.";
    } else {
      const total = guests.reduce((s, g) => s + (g.groupSize || 1), 0);
      text += `<b>${total} חיילים מגיעים:</b>\n`;
      guests.forEach(g => {
        text += `• ${g.name}${g.phone ? ` — ${g.phone}` : ""}${(g.groupSize ?? 1) > 1 ? ` (${g.groupSize})` : ""}\n`;
      });
    }
    await sendTelegramMessage(token, chatId, text.trim());
  }

  await sendTelegramMessage(token, chatId, "זה הכל.", inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
}

// ── Soldier: new request — step by step ──────────────────────────

async function srStart(token, chatId) {
  await saveSession(chatId, { state: "sr_date", temp_data: {} });
  const f = getNextFridays(4);
  await sendTelegramMessage(token, chatId, "🍽️ <b>בקשת אירוח חדשה</b>\n\nלאיזה שבת?",
    inlineKeyboard([
      f.slice(0, 2).map(d => btn(d.label, `sr_date:${d.value}`)),
      f.slice(2, 4).map(d => btn(d.label, `sr_date:${d.value}`)),
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function srKosher(token, chatId, date) {
  await saveSession(chatId, { state: "sr_kosher", temp_data: { when: date } });
  await sendTelegramMessage(token, chatId, `תאריך: <b>${date}</b>\n\nמה רמת הכשרות שלך?`,
    inlineKeyboard([
      [btn("ללא העדפה", "sr_kosher:none"), btn("כשר", "sr_kosher:separated")],
      [btn("כשר למהדרין", "sr_kosher:mehadrin")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function srShabbat(token, chatId, temp) {
  await saveSession(chatId, { state: "sr_shabbat", temp_data: temp });
  await sendTelegramMessage(token, chatId, "שמירת שבת?",
    inlineKeyboard([
      [btn("לא שומר", "sr_shabbat:none"), btn("מסורתי", "sr_shabbat:traditional")],
      [btn("שומר שבת", "sr_shabbat:keeps")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function srGuests(token, chatId, temp) {
  await saveSession(chatId, { state: "sr_guests", temp_data: temp });
  await sendTelegramMessage(token, chatId, "כמה אנשים?",
    inlineKeyboard([
      [btn("1", "sr_guests:1"), btn("2", "sr_guests:2"), btn("3", "sr_guests:3"), btn("4", "sr_guests:4")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function srSleep(token, chatId, temp) {
  await saveSession(chatId, { state: "sr_sleep", temp_data: temp });
  await sendTelegramMessage(token, chatId, "צריך לינה?",
    inlineKeyboard([[btn("כן", "sr_sleep:yes"), btn("לא", "sr_sleep:no")], [btn("❌ ביטול", "menu:main")]]));
}

async function srConfirm(token, chatId, temp) {
  await saveSession(chatId, { state: "sr_confirm", temp_data: temp });
  const kLabel = { none: "ללא העדפה", separated: "כשר", mehadrin: "כשר למהדרין" }[temp.kosher] ?? temp.kosher;
  const sLabel = { none: "לא שומר", traditional: "מסורתי", keeps: "שומר שבת" }[temp.shabbat] ?? temp.shabbat;
  await sendTelegramMessage(token, chatId,
    `📋 <b>אישור הבקשה:</b>\n\nתאריך: ${temp.when}\nכשרות: ${kLabel}\nשבת: ${sLabel}\nאנשים: ${temp.guestCount}\nלינה: ${temp.needSleep ? "כן" : "לא"}`,
    inlineKeyboard([[btn("✅ שלח בקשה", "sr_submit"), btn("❌ ביטול", "menu:main")]]));
}

async function srSubmit(token, chatId, session) {
  const { user_id, temp_data: t } = session;
  try {
    const ref = db.collection("soldier_hosting_searches").doc();
    await ref.set({
      id: ref.id, soldier_id: user_id, when: t.when,
      kosher: t.kosher, shabbat: t.shabbat,
      guestCount: parseInt(t.guestCount), needSleep: t.needSleep,
      transport: false, walkDistance: false, is_match: false,
      source: "telegram", created_at: FieldValue.serverTimestamp(),
    });
    await resetSession(chatId);
    await sendTelegramMessage(token, chatId,
      "✅ <b>הבקשה נשלחה!</b>\n\nמחפשים לך משפחה ונודיע ברגע שנמצאה התאמה. 🏠",
      inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
  } catch (e) {
    console.error("sr_submit error:", e);
    await sendTelegramMessage(token, chatId, "אירעה שגיאה. נסה שוב מאוחר יותר.",
      inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
  }
}

// ── Host: new hosting — step by step ─────────────────────────────

async function nhStart(token, chatId) {
  await saveSession(chatId, { state: "nh_date", temp_data: {} });
  const f = getNextFridays(4);
  await sendTelegramMessage(token, chatId, "🏠 <b>אירוח חדש</b>\n\nלאיזה שבת?",
    inlineKeyboard([
      f.slice(0, 2).map(d => btn(d.label, `nh_date:${d.value}`)),
      f.slice(2, 4).map(d => btn(d.label, `nh_date:${d.value}`)),
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function nhSoldiers(token, chatId, date) {
  await saveSession(chatId, { state: "nh_soldiers", temp_data: { date } });
  await sendTelegramMessage(token, chatId, `תאריך: <b>${date}</b>\n\nכמה חיילים תוכלו לארח?`,
    inlineKeyboard([
      [btn("1", "nh_soldiers:1"), btn("2", "nh_soldiers:2"), btn("3", "nh_soldiers:3")],
      [btn("4", "nh_soldiers:4"), btn("5", "nh_soldiers:5"), btn("6", "nh_soldiers:6")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function nhKosher(token, chatId, temp) {
  await saveSession(chatId, { state: "nh_kosher", temp_data: temp });
  await sendTelegramMessage(token, chatId, "רמת הכשרות במטבח?",
    inlineKeyboard([
      [btn("לא כשר", "nh_kosher:none"), btn("כשר", "nh_kosher:separated")],
      [btn("כשר למהדרין", "nh_kosher:mehadrin")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function nhTime(token, chatId, temp) {
  await saveSession(chatId, { state: "nh_time", temp_data: temp });
  await sendTelegramMessage(token, chatId, "באיזו שעה תתקיים הארוחה?",
    inlineKeyboard([
      [btn("12:00", "nh_time:12:00"), btn("13:00", "nh_time:13:00"), btn("14:00", "nh_time:14:00")],
      [btn("19:00", "nh_time:19:00"), btn("20:00", "nh_time:20:00"), btn("21:00", "nh_time:21:00")],
      [btn("❌ ביטול", "menu:main")],
    ]));
}

async function nhSleep(token, chatId, temp) {
  await saveSession(chatId, { state: "nh_sleep", temp_data: temp });
  await sendTelegramMessage(token, chatId, "האם יש אפשרות לינה?",
    inlineKeyboard([[btn("כן", "nh_sleep:yes"), btn("לא", "nh_sleep:no")], [btn("❌ ביטול", "menu:main")]]));
}

async function nhConfirm(token, chatId, temp) {
  await saveSession(chatId, { state: "nh_confirm", temp_data: temp });
  const kLabel = { none: "לא כשר", separated: "כשר", mehadrin: "כשר למהדרין" }[temp.hostKosher] ?? temp.hostKosher;
  await sendTelegramMessage(token, chatId,
    `📋 <b>אישור האירוח:</b>\n\nתאריך: ${temp.date}\nחיילים: ${temp.soldiers}\nכשרות: ${kLabel}\nשעה: ${temp.time}\nלינה: ${temp.sleepOvernight ? "כן" : "לא"}`,
    inlineKeyboard([[btn("✅ פתח אירוח", "nh_submit"), btn("❌ ביטול", "menu:main")]]));
}

async function nhSubmit(token, chatId, session) {
  const { user_id, temp_data: t } = session;
  const familySnap = await db.collection("families").doc(user_id).get();
  const family = familySnap.exists ? familySnap.data() : {};
  try {
    const ref = db.collection("family_hostings").doc();
    await ref.set({
      id: ref.id, family_id: user_id, date: t.date,
      soldiers: parseInt(t.soldiers), hostKosher: t.hostKosher,
      time: t.time, sleepOvernight: t.sleepOvernight,
      status: "open", guests: [], occupied: 0, is_fully_booked: false,
      hostShabbat: family.hostShabbat ?? "none",
      hostLanguages: family.hostLanguages ?? [],
      hostCooking: family.hostCooking ?? [],
      hasPets: family.hasPets ?? false,
      pickup: family.pickup ?? false,
      hostLat: family.hostLat ?? null, hostLng: family.hostLng ?? null,
      hostCity: family.hostCity ?? null, hostName: family.hostName ?? null,
      source: "telegram", created_at: FieldValue.serverTimestamp(),
    });
    await resetSession(chatId);
    await sendTelegramMessage(token, chatId,
      "✅ <b>האירוח נפתח!</b>\n\nנחפש חיילים שמתאימים ונעדכן ברגע שנמצאה התאמה. 🔔",
      inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
  } catch (e) {
    console.error("nh_submit error:", e);
    await sendTelegramMessage(token, chatId, "אירעה שגיאה. נסה שוב.",
      inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
  }
}

// ── Webhook ───────────────────────────────────────────────────────
//
// Register once after deploy:
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<FUNCTION_URL>"
// ─────────────────────────────────────────────────────────────────
exports.telegramWebhook = onRequest(
  { region: "me-west1", secrets: [TELEGRAM_BOT_TOKEN] },
  async (req, res) => {
    if (req.method !== "POST") return res.sendStatus(405);
    res.sendStatus(200); // Acknowledge before any async work — Telegram retries after 5 s

    const token = TELEGRAM_BOT_TOKEN.value();
    const update = req.body;

    // ── Button press ─────────────────────────────────────────────
    if (update.callback_query) {
      const { id: queryId, from, data } = update.callback_query;
      const chatId = from.id;
      await answerCallbackQuery(token, queryId);

      const session = await getSession(chatId);
      if (!session?.user_id) return;

      // Navigation
      if (data === "menu:main")    { await resetSession(chatId); return showMainMenu(token, chatId, session.role, session.name); }
      if (data === "menu:status")  return handleStatus(token, chatId, session);
      if (data === "menu:guests")  return handleGuests(token, chatId, session);
      if (data === "menu:new_request") return srStart(token, chatId);
      if (data === "menu:new_hosting") return nhStart(token, chatId);
      if (data === "menu:help")
        return sendTelegramMessage(token, chatId,
          "❓ <b>עזרה</b>\n\nבאמצעות הבוט ניתן לפתוח בקשת אירוח, לבדוק שיבוץ ולראות מי מגיע לאירוח.\nלשאלות נוספות פנו לאפליקציה.",
          inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));

      // Confirm match (triggers onActiveMatchApproved)
      if (data.startsWith("confirm:")) {
        const matchId = data.slice(8);
        try {
          await db.collection("active_matches").doc(matchId).update({ status: "approved" });
          await sendTelegramMessage(token, chatId, "✅ אישרת את ההגעה! נתראה בשבת 🍽️",
            inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
        } catch (e) {
          await sendTelegramMessage(token, chatId, "אירעה שגיאה. נסה שוב.");
        }
        return;
      }

      // Rematch — replicates requestRematch logic (temporary ban)
      if (data.startsWith("rematch:")) {
        const matchId = data.slice(8);
        try {
          const matchSnap = await db.collection("active_matches").doc(matchId).get();
          if (matchSnap.exists) {
            const match = matchSnap.data();
            await db.collection("active_match_archive").doc(matchId).set({
              ...match, final_status: "canceled_by_soldier", archived_at: new Date().toISOString(),
            });
            await db.collection("active_matches").doc(matchId).delete();
            await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
              is_match: false,
              temporarily_banned_families: FieldValue.arrayUnion(match.family_id),
            });
            await tryAllCompromiseLevels(match.soldier_request_id);
          }
          await sendTelegramMessage(token, chatId, "🔄 מחפשים לך שיבוץ חדש...",
            inlineKeyboard([[btn("🔙 תפריט", "menu:main")]]));
        } catch (e) {
          await sendTelegramMessage(token, chatId, "אירעה שגיאה. נסה שוב.");
        }
        return;
      }

      // Soldier new-request flow
      if (data.startsWith("sr_date:"))   return srKosher(token, chatId, data.slice(8));
      if (data.startsWith("sr_kosher:")) {
        const s = await getSession(chatId);
        return srShabbat(token, chatId, { ...s.temp_data, kosher: data.slice(9) });
      }
      if (data.startsWith("sr_shabbat:")) {
        const s = await getSession(chatId);
        return srGuests(token, chatId, { ...s.temp_data, shabbat: data.slice(11) });
      }
      if (data.startsWith("sr_guests:")) {
        const s = await getSession(chatId);
        return srSleep(token, chatId, { ...s.temp_data, guestCount: data.slice(10) });
      }
      if (data.startsWith("sr_sleep:")) {
        const s = await getSession(chatId);
        return srConfirm(token, chatId, { ...s.temp_data, needSleep: data.slice(9) === "yes" });
      }
      if (data === "sr_submit") return srSubmit(token, chatId, session);

      // Host new-hosting flow
      if (data.startsWith("nh_date:"))     return nhSoldiers(token, chatId, data.slice(8));
      if (data.startsWith("nh_soldiers:")) {
        const s = await getSession(chatId);
        return nhKosher(token, chatId, { ...s.temp_data, soldiers: data.slice(12) });
      }
      if (data.startsWith("nh_kosher:")) {
        const s = await getSession(chatId);
        return nhTime(token, chatId, { ...s.temp_data, hostKosher: data.slice(10) });
      }
      if (data.startsWith("nh_time:")) {
        const s = await getSession(chatId);
        const time = data.slice(8); // "12:00"
        return nhSleep(token, chatId, { ...s.temp_data, time });
      }
      if (data.startsWith("nh_sleep:")) {
        const s = await getSession(chatId);
        return nhConfirm(token, chatId, { ...s.temp_data, sleepOvernight: data.slice(9) === "yes" });
      }
      if (data === "nh_submit") return nhSubmit(token, chatId, session);

      return;
    }

    // ── Text message ─────────────────────────────────────────────
    const message = update?.message;
    if (!message?.text || !message?.chat?.id) return;

    const chatId = message.chat.id;
    const text = message.text.trim();

    // /start <uid> — connect account
    if (text.startsWith("/start")) {
      const uid = text.split(" ")[1]?.trim();
      if (!uid) {
        return sendTelegramMessage(token, chatId,
          "ברוכים הבאים לבוט ממולאים! 🏠\nלחיבור החשבון פתחו את האפליקציה ולחצו על 'חבר את הטלגרם שלך'.");
      }

      let userRef = null, role = null, name = null;
      const soldierSnap = await db.collection("soldiers").doc(uid).get();
      if (soldierSnap.exists) {
        userRef = soldierSnap.ref; role = "soldier";
        name = soldierSnap.data().fullName ?? null;
      } else {
        const familySnap = await db.collection("families").doc(uid).get();
        if (familySnap.exists) {
          userRef = familySnap.ref; role = "host";
          name = familySnap.data().hostName ?? null;
        }
      }

      if (!userRef)
        return sendTelegramMessage(token, chatId, "לא מצאנו את החשבון שלך. נסו שוב מתוך האפליקציה.");

      await userRef.update({ telegram_chat_id: chatId });
      await saveSession(chatId, { user_id: uid, role, name, state: "idle", temp_data: {} });
      await sendTelegramMessage(token, chatId, `✅ ${name ? `${name}, ` : ""}חשבון הטלגרם חובר בהצלחה! 🎉`);
      return showMainMenu(token, chatId, role, name);
    }

    // /menu — show main menu
    if (text === "/menu") {
      const session = await getSession(chatId);
      return session?.user_id
        ? showMainMenu(token, chatId, session.role, session.name)
        : sendTelegramMessage(token, chatId, "אנא חברו את החשבון מתוך האפליקציה תחילה.");
    }

    // Any other text — show menu or prompt to connect
    const session = await getSession(chatId);
    return session?.user_id
      ? showMainMenu(token, chatId, session.role, session.name)
      : sendTelegramMessage(token, chatId, "שלום! 👋 לחיבור החשבון פתחו את האפליקציה ולחצו על 'חבר את הטלגרם שלך'.");
  }
);

// ── HELPER FUNCTIONS FOR RECIPE RECOMMENDATION ──────────────────

async function callGroq(messages, jsonMode = true, temperature = 0.0) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not defined in process.env");
    throw new HttpsError("failed-precondition", "GROQ_API_KEY is not configured on the server.");
  }

  const maxRetries = 5;
  let attempt = 0;

  while (true) {
    attempt++;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature
      })
    });

    if (response.status === 429 && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.warn(`Groq rate limit hit (429). Retrying attempt ${attempt} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new HttpsError("internal", `Groq API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new HttpsError("internal", "Groq API returned an empty completion.");
    }

    return jsonMode ? JSON.parse(content) : content;
  }
}

async function searchSpoonacular(queryParams) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    console.error("SPOONACULAR_API_KEY is not defined in process.env");
    throw new HttpsError("failed-precondition", "SPOONACULAR_API_KEY is not configured on the server.");
  }

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("addRecipeInformation", "true");
  url.searchParams.set("fillIngredients", "true");
  url.searchParams.set("number", "30");
  url.searchParams.set("instructionsRequired", "true");

  if (queryParams.query) {
    url.searchParams.set("query", queryParams.query);
  }
  if (queryParams.includeIngredients && queryParams.includeIngredients.length > 0) {
    url.searchParams.set("includeIngredients", queryParams.includeIngredients.join(","));
  }
  if (queryParams.excludeIngredients && queryParams.excludeIngredients.length > 0) {
    url.searchParams.set("excludeIngredients", queryParams.excludeIngredients.join(","));
  }
  if (queryParams.diet) {
    url.searchParams.set("diet", queryParams.diet);
  }

  console.log("Spoonacular complexSearch url:", url.toString().replace(apiKey, "HIDDEN"));
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spoonacular API error:", response.status, errorText);
    throw new HttpsError("internal", `Spoonacular API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function translateAndFormatRecipe(candidate, soldier) {
  const systemPromptTranslate = 
    "You are a professional chef and translation expert.\n" +
    "Your task is to translate an English recipe into high-quality, warm, and natural Hebrew (עברית).\n" +
    "You must return ONLY a valid JSON object matching the target schema.\n\n" +
    "Target JSON structure:\n" +
    "{\n" +
    '  "title": "Hebrew recipe title",\n' +
    '  "description": "Hebrew validation summary explaining why this recipe matches the soldier\'s requirements and preferences",\n' +
    '  "ingredients": [\n' +
    '    "Hebrew translated ingredient with quantities",\n' +
    '    "Hebrew translated ingredient with quantities"\n' +
    '  ],\n' +
    '  "instructions": [\n' +
    '    "Hebrew translated instruction step 1",\n' +
    '    "Hebrew translated instruction step 2"\n' +
    '  ],\n' +
    '  "matching_preferences": [\n' +
    '    "Matched preferences in Hebrew (e.g., כשר, ללא גלוטן, צמחוני, אהוב)"\n' +
    '  ]\n' +
    "}";

  const rawIngredients = (candidate.extendedIngredients || []).map(i => i.original).slice(0, 20);
  
  let instructionsList = [];
  const analyzed = candidate.analyzedInstructions || [];
  if (analyzed && Array.isArray(analyzed) && analyzed.length > 0) {
    for (const step of (analyzed[0].steps || [])) {
      if (step.step) instructionsList.push(step.step);
    }
  } else {
    const rawInst = candidate.instructions || "";
    if (rawInst) {
      instructionsList = rawInst
        .replace(/<ol>/g, "")
        .replace(/<\/ol>/g, "")
        .replace(/<li>/g, "")
        .replace(/<\/li>/g, "")
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
  }
  instructionsList = instructionsList.slice(0, 15);
  if (instructionsList.length === 0) {
    instructionsList = ["Cook according to taste."];
  }

  const userPromptTranslate = 
    `Original English Recipe details:\n` +
    `Title: ${candidate.title}\n` +
    `Ingredients:\n${rawIngredients.map(ing => `- ${ing}`).join("\n")}\n` +
    `Instructions:\n${instructionsList.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}\n\n` +
    `Please translate all details into Hebrew. Keep translations brief and concise. The ingredients and instructions list must be fully translated. Ensure the description explains why it matches the soldier's preferences in Hebrew.`;

  const translated = await callGroq([
    { role: "system", content: systemPromptTranslate },
    { role: "user", content: userPromptTranslate }
  ], true, 0.2);

  return {
    id: candidate.id,
    recipe_id: candidate.id,
    title: translated.title || candidate.title,
    description: translated.description || "",
    ingredients: translated.ingredients || [],
    instructions: translated.instructions || [],
    matching_preferences: translated.matching_preferences || [],
    image_url: candidate.image || "",
    readyInMinutes: candidate.readyInMinutes || 30,
    servings: candidate.servings || 4
  };
}

// ── CALLABLE: generate personalized recipes ────────────────────────

exports.generateRecipes = onCall(
  async (req) => {
    const { soldier, host, count = 2 } = req.data || {};
    
    const kosherRequired = host?.keepsKosher || soldier?.isKosher;
    console.log(`Starting recipe generation. Kosher Required: ${kosherRequired}, count: ${count}`);

    // Step 2: Use LLM to analyze preferences and generate Spoonacular API search parameters
    const systemPromptQuery = 
      "You are a translation and culinary assistant. Your task is to analyze food preferences and restrictions " +
      "and generate optimized English search parameters for the Spoonacular API to find matching recipes.\n" +
      "You must return ONLY a JSON object and nothing else.\n\n" +
      "JSON structure:\n" +
      "{\n" +
      '  "query": "English search term like chicken or pasta or salad or beef or empty string",\n' +
      '  "includeIngredients": ["english ingredient 1", "english ingredient 2"],\n' +
      '  "excludeIngredients": ["english allergen/disliked 1", "english allergen/disliked 2"],\n' +
      '  "diet": "vegetarian or vegan or gluten free or empty string"\n' +
      "}";

    const userPromptQuery = 
      `Analyze these preferences:\n` +
      `- Favorite Foods (often in Hebrew): ${JSON.stringify(soldier?.favoriteFoods || [])}\n` +
      `- Disliked Foods (often in Hebrew): ${JSON.stringify(soldier?.dislikedFoods || [])}\n` +
      `- Allergies (often in Hebrew): ${JSON.stringify(soldier?.allergies || [])}\n` +
      `- Dietary Preferences (often in Hebrew): ${JSON.stringify(soldier?.dietaryPreferences || [])}\n` +
      `- Kosher Required: ${kosherRequired ? "Yes" : "No"}`;

    let queryParams = { query: "", includeIngredients: [], excludeIngredients: [], diet: "" };
    try {
      queryParams = await callGroq([
        { role: "system", content: systemPromptQuery },
        { role: "user", content: userPromptQuery }
      ]);
      console.log("Generated Spoonacular query parameters from Groq:", queryParams);
    } catch (err) {
      console.error("Error generating query parameters via Groq, using basic fallback:", err);
      queryParams.excludeIngredients = [...(soldier?.allergies || []), ...(soldier?.dislikedFoods || [])];
    }

    // Step 3: Query Spoonacular API for candidate recipes
    let candidates = [];
    try {
      candidates = await searchSpoonacular(queryParams);
      console.log(`Retrieved ${candidates.length} recipe candidates from Spoonacular.`);

      // If no candidates, try relaxing the query parameters (e.g. drop query and includeIngredients)
      if ((!candidates || candidates.length === 0) && (queryParams.includeIngredients?.length > 0 || queryParams.query)) {
        console.log("No candidates returned from initial search. Relaxing search filters.");
        candidates = await searchSpoonacular({
          excludeIngredients: queryParams.excludeIngredients,
          diet: queryParams.diet
        });
        console.log(`Retrieved ${candidates.length} relaxed candidates.`);
      }
    } catch (err) {
      console.error("Spoonacular search failed completely:", err);
      throw new HttpsError("internal", "Failed to retrieve recipes from Spoonacular.");
    }

    // Step 4 & 5: Recipe Validation Loop by Groq
    const validRecipes = [];
    const maxAttempts = 15;
    let attempts = 0;

    const systemPromptValidate = 
      "You are an expert culinary safety inspector. Your task is to validate if a recipe is completely safe, " +
      "matches the soldier's and host family's requirements. You must return ONLY a JSON object and nothing else.\n\n" +
      "JSON structure:\n" +
      "{\n" +
      '  "is_valid": true or false,\n' +
      '  "reason": "brief explanation in English of your decision"\n' +
      "}";

    for (const candidate of candidates) {
      if (validRecipes.length >= count) break;
      if (attempts >= maxAttempts) {
        console.warn("Reached maximum number of LLM validation attempts.");
        break;
      }

      attempts++;
      
      // Enforce distinctiveness by checking titles (both English and Hebrew)
      const selectedTitlesEng = validRecipes.map(r => r.titleEng);
      
      let userPromptValidate = 
        `Soldier & Host Family Constraints:\n` +
        `- Favorite Foods: ${JSON.stringify(soldier?.favoriteFoods || [])}\n` +
        `- Disliked Foods: ${JSON.stringify(soldier?.dislikedFoods || [])}\n` +
        `- Allergies: ${JSON.stringify(soldier?.allergies || [])}\n` +
        `- Dietary Restrictions: ${JSON.stringify(soldier?.dietaryPreferences || [])}\n` +
        `- Is Kosher Required: ${kosherRequired ? "Yes" : "No"}\n\n` +
        `Recipe to Validate:\n` +
        `- Title: ${candidate.title}\n` +
        `- Ingredients: ${JSON.stringify((candidate.extendedIngredients || []).map(i => i.original))}\n` +
        `- Instructions: ${candidate.instructions || ""}\n\n`;

      if (selectedTitlesEng.length > 0) {
        userPromptValidate += 
          `Already Selected Recipes in this session: ${JSON.stringify(selectedTitlesEng)}\n` +
          `CRITICAL: The new recipe must be a completely different type of dish and cannot be a minor variation or similar type of dish to the already selected recipes (e.g. no similar pasta types, no similar chicken dishes, etc.).\n\n`;
      }

      userPromptValidate += 
        `Validate against these rules:\n` +
        `1. Must NOT contain any allergens.\n` +
        `2. Must NOT contain any disliked ingredients.\n` +
        `3. If Kosher required: Must NOT contain non-kosher ingredients (pork, bacon, ham, shellfish, shrimp, crab, lobster, etc.) and MUST NOT mix meat and dairy.\n` +
        `4. Must match dietary restrictions (e.g. vegetarian, vegan).\n` +
        `5. Must be a distinct type of dish from any already selected recipes.\n`;

      try {
        const validationResult = await callGroq([
          { role: "system", content: systemPromptValidate },
          { role: "user", content: userPromptValidate }
        ]);

        if (validationResult.is_valid) {
          console.log(`Recipe '${candidate.title}' is valid! Translating...`);
          const translatedRecipe = await translateAndFormatRecipe(candidate, soldier);
          translatedRecipe.titleEng = candidate.title;
          validRecipes.push(translatedRecipe);
        } else {
          console.log(`Recipe '${candidate.title}' rejected. Reason: ${validationResult.reason}`);
        }
      } catch (err) {
        console.error(`Error validating recipe '${candidate.title}':`, err);
      }
    }

    // Step 6 fallback: if we couldn't find enough validated distinct recipes, fill list with remaining candidates
    if (validRecipes.length < count) {
      console.log(`Could only validate ${validRecipes.length} recipes. Finding next candidate to fill list without strict validation.`);
      for (const candidate of candidates) {
        if (validRecipes.length >= count) break;
        const isAlreadySelected = validRecipes.some(r => r.id === candidate.id);
        if (!isAlreadySelected) {
          try {
            const translatedRecipe = await translateAndFormatRecipe(candidate, soldier);
            translatedRecipe.titleEng = candidate.title;
            validRecipes.push(translatedRecipe);
            console.log(`Added candidate '${candidate.title}' as fallback.`);
          } catch (err) {
            console.error("Error formatting fallback recipe:", err);
          }
        }
      }
    }

    // Remove the temporary titleEng field before returning to frontend
    const cleanedRecipes = validRecipes.map(r => {
      const { titleEng, ...rest } = r;
      return rest;
    });

    return { recipes: cleanedRecipes };
  }
);

// ──────────────────────────────────────────────────────────────────
// SCHEDULED: every Wednesday at 17:00 Israel time
// Remind registered families who have no upcoming hosting to open one.
// ──────────────────────────────────────────────────────────────────
exports.sendWednesdayHostingReminder = onSchedule(
  { schedule: "0 17 * * 3", timeZone: "Asia/Jerusalem" },
  async () => {
    // Find next Friday (= upcoming Shabbat hosting date)
    const now = new Date();
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
    const friday = new Date(now);
    friday.setDate(friday.getDate() + daysUntilFriday);
    const fridayStr = friday.toISOString().split("T")[0];

    // Which families already have an active hosting for that Friday?
    const existingSnap = await db.collection("family_hostings")
      .where("date", "==", fridayStr)
      .get();
    const familiesWithHosting = new Set(
      existingSnap.docs
        .filter(d => d.data().status !== "canceled")
        .map(d => d.data().family_id)
    );

    // Notify every other registered family
    const familiesSnap = await db.collection("families").get();
    for (const familyDoc of familiesSnap.docs) {
      if (familiesWithHosting.has(familyDoc.id)) continue;
      try {
        await createNotification(
          familyDoc.id, "host",
          `שבת קרבה ובאה 🕯️ האם תרצו לארח חיילים השבת (${fridayStr})? פתחו אירוח עכשיו ונשבץ אליכם חיילים.`,
          "wednesday_reminder",
          "רוצים לארח השבת?"
        );
      } catch (e) { console.error("notification error (wednesday_reminder):", e); }
    }
  }
);


