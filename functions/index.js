const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

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

  const candidates = [];

  for (const hostingDoc of hostingsSnap.docs) {
    const hosting = hostingDoc.data();

    // Skip canceled hostings — they may still appear in the query if
    // is_fully_booked was not set when status was changed to "canceled"
    if (hosting.status === "canceled") continue;

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

  const guestCount = request.guestCount ?? 1;

  // Build a guest object — this is what the host dashboard reads to show occupancy
  const guestObj = {
    match_id:      null,          // filled in below after we have the doc ref
    soldier_id:    soldier.id ?? request.soldier_id,
    name:          soldier.fullName ?? soldier.name ?? "חייל",
    unit:          soldier.unit   ?? null,
    age:           soldier.age    ?? null,
    avatarColor:   soldier.avatarPreview ?? "#6f8f72",
    kosher:        request.kosher  ?? "none",
    allergies:     soldier.allergies ?? [],
    bio:           soldier.bio ?? null,
    needSleep:     request.needSleep  ?? false,
    needsTransport: request.transport ?? false,
    walkDistance:  request.walkDistance ?? false,
    groupSize:     guestCount,
  };

  // Save the match
  const matchRef = db.collection("active_matches").doc();
  guestObj.match_id = matchRef.id;   // back-fill now that we have the id

  await matchRef.set({
    id: matchRef.id,
    soldier_request_id: requestId,
    host_offer_id: best.hosting.id,
    family_id: best.family.id,
    family_name: best.family.hostName ?? null,
    family_city: best.family.hostCity ?? null,
    status: "pending_soldier_approval",
    score: best.score,
    compromise_level: compromiseLevel,
    compromise_notes: compromiseNotes,
    guest_object: guestObj,           // stored so rematch can remove the exact entry
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
    console.log("🔔 onNewSoldierRequest triggered for:", requestId);
    try {
      const result = await runMatchingForRequest(requestId, COMPROMISE.NONE);
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

  // If the match was already confirmed by the soldier, free up the reserved seats
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
// Call with: { match_id }
// Updates match status → "approved" and adds the guest to the
// family_hostings.guests array so the host can see the confirmation.
// ──────────────────────────────────────────────────────────────────
exports.confirmMatch = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Must be signed in");

  const { match_id } = req.data;
  if (!match_id) throw new HttpsError("invalid-argument", "match_id is required");

  const matchSnap = await db.collection("active_matches").doc(match_id).get();
  if (!matchSnap.exists) throw new HttpsError("not-found", "Match not found");
  const match = matchSnap.data();

  if (match.status !== "pending_soldier_approval") {
    return { success: true, message: "Already confirmed" };
  }

  // Mark match as approved
  await db.collection("active_matches").doc(match_id).update({ status: "approved" });

  // Add guest to family hosting so the host can see it
  const guestObj = match.guest_object;
  if (guestObj && match.host_offer_id) {
    const hostingRef = db.collection("family_hostings").doc(match.host_offer_id);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(hostingRef);
      if (!snap.exists) return;
      const d = snap.data();
      const existingGuests = d.guests || [];
      if (existingGuests.some((g) => g.match_id === match_id)) return; // already added
      const updatedGuests = [...existingGuests, guestObj];
      const newTotal = updatedGuests.reduce((s, g) => s + (g.groupSize || 1), 0);
      const capacity = parseInt(d.soldiers) || 0;
      tx.update(hostingRef, {
        guests: updatedGuests,
        is_fully_booked: capacity > 0 && newTotal >= capacity,
      });
    });
  }

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

  // 1. Mark the hosting as canceled
  await db.collection("family_hostings").doc(hosting_id).update({ status: "canceled" });

  // 2. Find all active matches for this hosting
  const matchesSnap = await db
    .collection("active_matches")
    .where("host_offer_id", "==", hosting_id)
    .where("status", "in", ["pending_soldier_approval", "approved"])
    .get();

  const rematchResults = [];

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data();

    // 3. Mark match as canceled by host
    await matchDoc.ref.update({ status: "canceled_by_host" });

    // 4. Reopen soldier's request + temporarily ban this family
    await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
      is_match: false,
      temporarily_banned_families: FieldValue.arrayUnion(match.family_id),
    });

    // 5. Try to find a new match
    const newMatch = await tryAllCompromiseLevels(match.soldier_request_id);
    rematchResults.push({
      soldier_request_id: match.soldier_request_id,
      new_match: newMatch ? newMatch.match_id : null,
    });
  }

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
exports.onHostingCanceled = onDocumentUpdated(
  { document: "family_hostings/{hostingId}", region: "me-west1" },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    // Only react when status changes TO "canceled"
    if (before.status === after.status || after.status !== "canceled") return;

    const hostingId = event.params.hostingId;
    console.log("🔔 Hosting canceled:", hostingId);

    // Find all non-rejected matches for this hosting
    const matchesSnap = await db
      .collection("active_matches")
      .where("host_offer_id", "==", hostingId)
      .where("status", "in", ["pending_soldier_approval", "approved"])
      .get();

    if (matchesSnap.empty) return;
    console.log(`↩️  Re-queuing ${matchesSnap.size} soldier(s)`);

    for (const matchDoc of matchesSnap.docs) {
      const match = matchDoc.data();

      // 1. Mark match as canceled by host
      await matchDoc.ref.update({ status: "canceled_by_host" });

      // 2. Reopen the soldier's request + ban this family temporarily
      await db.collection("soldier_hosting_searches").doc(match.soldier_request_id).update({
        is_match: false,
        temporarily_banned_families: FieldValue.arrayUnion(match.family_id),
      });

      // 3. Find a new match for this soldier
      const newMatch = await tryAllCompromiseLevels(match.soldier_request_id);
      console.log(
        `✅ Soldier ${match.soldier_id}: ${newMatch ? "new match found" : "no match yet, will retry"}`
      );
    }
  }
);
