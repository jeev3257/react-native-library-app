import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlXWJCUBI905JUzNQhGdfkVRecURL6EUo",
  authDomain: "miniapp-9052d.firebaseapp.com",
  projectId: "miniapp-9052d",
  storageBucket: "miniapp-9052d.firebasestorage.app",
  messagingSenderId: "956165747709",
  appId: "1:956165747709:web:c91bebd61a77260f8e9f94",
  measurementId: "G-8TS1NW9M1S"
};

let app;
if (app === undefined) {
  app = initializeApp(firebaseConfig);
} else {
  app = app;
}
const firestore = getFirestore(app);
const auth = getAuth(app);
export { auth , firestore};