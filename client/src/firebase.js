// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your web app config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDOBW3dTFOvr2GzBGwYzRsiPyJtkozT6Qw",
  authDomain: "resqnet-df587.firebaseapp.com",
  projectId: "resqnet-df587",
  storageBucket: "resqnet-df587.firebasestorage.app",
  messagingSenderId: "210253736309",
  appId: "1:210253736309:web:3cd3485bb7b45af528cb3c",
  measurementId: "G-M1SGE7M545"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
