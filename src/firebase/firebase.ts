// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA368pScFS5cAJdca4zG3m3QkG_WXuud1Y",
  authDomain: "swapstop-804be.firebaseapp.com",
  projectId: "swapstop-804be",
  storageBucket: "swapstop-804be.firebasestorage.app",
  messagingSenderId: "640388135987",
  appId: "1:640388135987:web:cb5e102fb06ff499e2b746",
  measurementId: "G-KKPZEPGQQC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
//const analytics = getAnalytics(app);
