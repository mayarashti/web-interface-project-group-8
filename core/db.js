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

  async deleteProfileImage(url) {
    if (!url) return false;
    try {
      const storageRef = window.storage.refFromURL(url);
      await storageRef.delete();
      return true;
    } catch (e) {
      console.error("Error deleting profile image:", e);
      return false;
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

  // Notifications
  // Returns an unsubscribe function. Calls `callback` with an array of
  // notification objects sorted newest-first whenever the collection changes.
  subscribeToNotifications(uid, callback) {
    console.log('[notif] starting Firestore listener for uid:', uid);
    return window.db.collection('notifications')
      .where('user_id', '==', uid)
      .orderBy('sent_at', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        console.log('[notif] Firestore snapshot:', snapshot.docs.length, 'docs');
        const notifications = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            time: d.sent_at ? d.sent_at.toDate().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '',
          };
        });
        callback(notifications);
      }, err => {
        console.error('notifications listener error:', err);
      });
  },

  async markNotificationRead(notificationId) {
    try {
      await window.db.collection('notifications').doc(notificationId).update({ read: true });
      return true;
    } catch (e) {
      console.error('Error marking notification read:', e);
      return false;
    }
  },

  async markAllNotificationsRead(uid) {
    try {
      const snap = await window.db.collection('notifications')
        .where('user_id', '==', uid)
        .where('read', '==', false)
        .get();
      if (snap.empty) return true;
      const batch = window.db.batch();
      snap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
      await batch.commit();
      return true;
    } catch (e) {
      console.error('Error marking all notifications read:', e);
      return false;
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
