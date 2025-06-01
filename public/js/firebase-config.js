// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCsp_hLW1819Wc5B6zA1TBtWYc-tdXIzu8",
    authDomain: "online-order-a6d5d.firebaseapp.com",
    projectId: "online-order-a6d5d",
    storageBucket: "online-order-a6d5d.firebasestorage.app",
    messagingSenderId: "663336912583",
    appId: "1:663336912583:web:e14d5e73d25e068a05e0e2",
    measurementId: "G-SNYEZ2VS5N"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase services
export { app, auth, db, storage, onAuthStateChanged };

// Check authentication state
export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Check if user is admin
export const checkIfAdmin = async (uid) => {
  try {
    const docRef = await getDoc(doc(db, 'admins', uid));
    return docRef.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};