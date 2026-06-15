// core/db.js
// Provides helper functions for interacting with Firestore.
// Assumes window.db and window.auth are initialized from core/firebase.js

window.DB = {
  // Storage
  async uploadProfileImage(uid, file, role) {
    try {
      const ext = file.name.split('.').pop();
      const filePath = `profile_images/${role}/${uid}/profile_${Date.now()}.${ext}`;
      const storageRef = window.storage.ref().child(filePath);
      await storageRef.put(file);
      return await storageRef.getDownloadURL();
    } catch (e) {
      console.error("Error uploading profile image:", e);
      return null;
    }
  },

  // Soldiers
  async getSoldierProfile(uid) {
    try {
      const docRef = window.db.collection('soldiers').doc(uid);
      const docSnap = await docRef.get();
      return docSnap.exists ? docSnap.data() : null;
    } catch (e) {
      console.error("Error fetching soldier profile:", e);
      return null;
    }
  },
  
  async saveSoldierProfile(uid, data) {
    try {
      // Remove any undefined fields which Firestore rejects
      const cleanData = JSON.parse(JSON.stringify(data));
      await window.db.collection('soldiers').doc(uid).set({
        ...cleanData,
        id: uid,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error saving soldier profile:", e);
      throw e;
    }
  },

  // Families
  async getFamilyProfile(uid) {
    try {
      const docRef = window.db.collection('families').doc(uid);
      const docSnap = await docRef.get();
      return docSnap.exists ? docSnap.data() : null;
    } catch (e) {
      console.error("Error fetching family profile:", e);
      return null;
    }
  },

  async saveFamilyProfile(uid, data) {
    try {
      const cleanData = JSON.parse(JSON.stringify(data));
      await window.db.collection('families').doc(uid).set({
        ...cleanData,
        id: uid,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error saving family profile:", e);
      throw e;
    }
  },

  // Hosting Searches (Soldier requests)
  async createHostingSearch(soldierId, data) {
    try {
      const docRef = window.db.collection('soldier_hosting_searches').doc();
      await docRef.set({
        ...data,
        id: docRef.id,
        soldier_id: soldierId,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        is_match: false
      });
      return docRef.id;
    } catch (e) {
      console.error("Error creating hosting search:", e);
      return null;
    }
  },

  // Family Hostings (Family offers)
  async createFamilyHosting(familyId, data) {
    try {
      const docRef = window.db.collection('family_hostings').doc();
      await docRef.set({
        ...data,
        id: docRef.id,
        family_id: familyId,
        status: 'open',
        guests: [],
        occupied: 0,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        is_fully_booked: false
      });
      return docRef.id;
    } catch (e) {
      console.error("Error creating family hosting:", e);
      return null;
    }
  },

  // Active Matches
  async createMatch(soldierRequestId, hostOfferId) {
    try {
      const docRef = window.db.collection('active_matches').doc();
      await docRef.set({
        id: docRef.id,
        soldier_request_id: soldierRequestId,
        host_offer_id: hostOfferId,
        status: 'approved', // Initial status
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      console.error("Error creating match:", e);
      return null;
    }
  }
};
