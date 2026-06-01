const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();
setGlobalOptions({ maxInstances: 10 });

// ─── Compromise levels (applied in order after 24h) ───────────────
const COMPROMISE = {
  NONE:   0,  // strict matching only
  RADIUS: 1,  // expand travelDistance by 20%
  PETS:   2,  // allow hasPets:true even if petsComfort:"no"
  TIME:   3,  // allow ±2h flexibility in arrival time
};

// ──────────────────────────────────────────────────────────────────
// KOSHER COMPATIBILITY
// Soldier request has kosher:true/false (does the soldier need kosher?)
// Soldier profile has kosher: "mehadrin" | "kosher" | "none"
// Family profile has hostKosher: "kitchen" | "separated" | "none"
//
// If request.kosher === false → any family is ok
// If request.kosher === true:
//   soldier "mehadrin" → family must be "kitchen"
//   soldier "kosher"   → family must be "kitchen" or "separated"
// ──────────────────────────────────────────────────────────────────
function isKosherCompatible(soldierKosherLevel, familyKosher) {
  const familyRank = { kitchen: 2, separated: 1, none: 0 };
  const soldierNeed = soldierKosherLevel === "mehadrin" ? 2 : 1;
  return (familyRank[familyKosher] ?? 0) >= soldierNeed;
}

// ──────────────────────────────────────────────────────────────────
// SHABBAT COMPATIBILITY
// Soldier request has shabbat:true/false (does the soldier need a shabbat home?)
// Family profile has hostShabbat: "keeps" | "traditional" | "none"
//
// If request.shabbat === false → any family is ok
// If request.shabbat === true → family must be "keeps"
// ──────────────────────────────────────────────────────────────────
function isShabbatCompatible(requestShabbat, familyShabbat) {
  if (!requestShabbat) return true;
  return familyShabbat === "keeps";
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

// ──────────────────────────────────────────────────────────────────
// HARD FILTER — returns false if this family cannot host this soldier
// ──────────────────────────────────────────────────────────────────
function passesHardFilters(soldier, request, family, hosting, bannedIds, compromiseLevel) {
  // Ban list (permanent + per-request)
  if (bannedIds.has(hosting.family_id)) return false;

  // Capacity — hosting.soldiers can be stored as a string
  const maxGuests = parseInt(hosting.soldiers) || 0;
  if (maxGuests < (request.guestCount ?? 1)) return false;

  // Shabbat — never compromised
  if (!isShabbatCompatible(request.shabbat, family.hostShabbat)) return false;

  // Kosher — never compromised
  if (request.kosher === true) {
    if (!isKosherCompatible(soldier.kosher, family.hostKosher)) return false;
  }

  // Diet/Allergies — soldier's allergies must be covered by family's cooking
  // (no compromise — dietary restrictions are a health need)
  const soldierAllergies = soldier.allergies ?? [];
  const familyCooking = family.hostCooking ?? [];
  if (soldierAllergies.some((a) => !familyCooking.includes(a))) return false;

  // Accommodation — if soldier needs to sleep over, family must offer it
  if (request.needSleep === true && hosting.sleepOvernight !== true) return false;

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

  // Geographic radius — soldier's travelDistance is their max km from lat/lng
  if (request.lat && request.lng && family.hostLat && family.hostLng) {
    let radius = request.travelDistance ?? 50;
    if (compromiseLevel >= COMPROMISE.RADIUS) radius *= 1.2;
    const dist = haversineKm(request.lat, request.lng, family.hostLat, family.hostLng);
    if (dist > radius) return false;
  }

  return true;
}

// ──────────────────────────────────────────────────────────────────
// SCORING — higher = better match (soft preferences)
// ──────────────────────────────────────────────────────────────────
function scoreFamily(soldier, request, family, hosting) {
  let score = 0;

  // Shared languages (soldier.languages vs family.hostLanguages)
  const soldierLangs = soldier.languages ?? [];
  const familyLangs = family.hostLanguages ?? [];
  // family stores full names like "עברית", soldier stores codes like "he"
  // count overlap on whichever format matches
  const sharedLangs = soldierLangs.filter((l) => familyLangs.includes(l));
  score += sharedLangs.length * 10;

  // Transportation — soldier needs pickup and family offers it
  if (request.transport === true && hosting.pickup === true) score += 15;

  // Pets — soldier is ok with pets and family has pets (positive vibe match)
  if (request.petsComfort === "ok" && family.hasPets === true) score += 5;

  // No pets and soldier prefers no pets
  if (request.petsComfort === "no" && family.hasPets === false) score += 10;

  // Exact kosher level bonus
  if (family.hostKosher === "kitchen" && soldier.kosher === "mehadrin") score += 10;
  if (family.hostKosher === "separated" && soldier.kosher === "kosher") score += 5;

  // Shabbat bonus — traditional is better than nothing even if soldier didn't require
  if (!request.shabbat && family.hostShabbat === "traditional") score += 5;

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

  const candidates = [];

  for (const hostingDoc of hostingsSnap.docs) {
    const hosting = hostingDoc.data();

    const familySnap = await db.collection("families").doc(hosting.family_id).get();
    if (!familySnap.exists) continue;
    const family = familySnap.data();

    if (!passesHardFilters(soldier, request, family, hosting, bannedIds, compromiseLevel)) continue;

    candidates.push({
      hosting,
      family,
      score: scoreFamily(soldier, request, family, hosting),
    });
  }

  if (candidates.length === 0) return null;

  // Pick the highest-scoring candidate
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  const compromiseNotes = buildCompromiseNotes(request, best.family, compromiseLevel);

  // Save the match
  const matchRef = db.collection("active_matches").doc();
  await matchRef.set({
    id: matchRef.id,
    soldier_request_id: requestId,
    host_offer_id: best.hosting.id,
    family_id: best.family.id,
    status: "pending_soldier_approval",
    score: best.score,
    compromise_level: compromiseLevel,
    compromise_notes: compromiseNotes,
    created_at: new Date().toISOString(),
  });

  // Mark soldier request as matched
  await db.collection("soldier_hosting_searches").doc(requestId).update({ is_match: true });

  return {
    match_id: matchRef.id,
    family_name: best.family.hostName,
    family_city: best.family.hostCity,
    hosting_id: best.hosting.id,
    score: best.score,
    compromise_notes: compromiseNotes,
  };
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
  "soldier_hosting_searches/{requestId}",
  async (event) => {
    await runMatchingForRequest(event.params.requestId, COMPROMISE.NONE);
  }
);

// ──────────────────────────────────────────────────────────────────
// TRIGGER: new family hosting → scan unmatched soldier requests
// ──────────────────────────────────────────────────────────────────
exports.onNewFamilyHosting = onDocumentCreated(
  "family_hostings/{hostingId}",
  async (event) => {
    const hosting = event.data.data();

    const unmatchedSnap = await db
      .collection("soldier_hosting_searches")
      .where("when", "==", hosting.date)
      .where("is_match", "==", false)
      .get();

    for (const doc of unmatchedSnap.docs) {
      const alreadyMatched = doc.data().is_match;
      if (!alreadyMatched) {
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

  // Reject the current match
  await db.collection("active_matches").doc(match_id).update({ status: "rejected" });

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
