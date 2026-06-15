const { onCall, HttpsError } = require("firebase-functions/v2/https");
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

// Bind the Maps secret to every function so the matching engine (invoked from
// triggers, callables and the scheduler) can call the Distance Matrix API.
setGlobalOptions({ maxInstances: 10, secrets: [GOOGLE_MAPS_API_KEY] });

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
  });

  // Mark soldier request as matched
  await db.collection("soldier_hosting_searches").doc(requestId).update({ is_match: true });

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

    await tryAllCompromiseLevels(match.soldier_request_id);
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

  // If the match was already confirmed, free up the reserved seats and fill the slot
  if (match.status === "approved" && match.host_offer_id) {
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
      await tryAllCompromiseLevels(after.soldier_request_id);
      return;
    }

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

    // If already confirmed, free the hosting slot and scan for a replacement
    if (match.status === "approved" && match.host_offer_id) {
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
