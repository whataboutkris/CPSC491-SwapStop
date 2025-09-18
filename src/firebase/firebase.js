// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";         // ← ADD THIS
import { getFirestore } from "firebase/firestore"; // ← ADD THIS
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA368pScFS5cAJdca4zG3m3QkG_WXuud1Y",
  authDomain: "swapstop-804be.firebaseapp.com",
  projectId: "swapstop-804be",
  storageBucket: "swapstop-804be.firebasestorage.app",
  messagingSenderId: "640388135987",
  appId: "1:640388135987:web:cb5e102fb06ff499e2b746",
  measurementId: "G-KKPZEPGQQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);