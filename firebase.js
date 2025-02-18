import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlXWJCUBI905JUzNQhGdfkVRecURL6EUo",
  authDomain: "miniapp-9052d.firebaseapp.com",
  projectId: "miniapp-9052d",
  storageBucket: "miniapp-9052d.firebasestorage.app",
  messagingSenderId: "956165747709",
  appId: "1:956165747709:web:c91bebd61a77260f8e9f94",
  measurementId: "G-8TS1NW9M1S",
  databaseURL: "https://miniapp-9052d-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let app;

if (getApps().length === 0) {
  // Initialize Firebase app only if it's not initialized
  app = initializeApp(firebaseConfig);
} else {
  // Use the existing app if it's already initialized
  app = getApp();
}

const firestore = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app); // Initialize Realtime Database

export { auth, firestore, database };
