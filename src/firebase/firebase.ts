// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAc8m-8-Gw-4XRNDxIhnLtI-6I1LPsfO2g",
  authDomain: "swapstop-3d6a2.firebaseapp.com",
  projectId: "swapstop-3d6a2",
  storageBucket: "swapstop-3d6a2.firebasestorage.app",
  messagingSenderId: "457436022589",
  appId: "1:457436022589:web:f19126d5c21538aef22754",
  measurementId: "G-KK8RWL7Y0L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);
