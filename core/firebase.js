// Initialize Firebase using the compat libraries for easier integration with CDN/Babel scripts
const firebaseConfig = {
  apiKey: "AIzaSyDzbphGj57tXjorZ-QuitbLi2HfqGaBXeI",
  authDomain: "memulaim-88a26.firebaseapp.com",
  projectId: "memulaim-88a26",
  storageBucket: "memulaim-88a26.firebasestorage.app",
  messagingSenderId: "682248918203",
  appId: "1:682248918203:web:2793453fff33fbf2a2459e",
  measurementId: "G-Y67N0SXRVG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Expose to window so our Babel components can use them
window.auth = auth;
window.db = db;
window.googleProvider = googleProvider;
