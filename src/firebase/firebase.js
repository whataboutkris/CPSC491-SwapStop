// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAc8m-8-Gw-4XRNDxIhnLtI-6I1LPsfO2g",
  authDomain: "swapstop-3d6a2.firebaseapp.com",
  projectId: "swapstop-3d6a2",
  storageBucket: "swapstop-3d6a2.firebasestorage.app",
  messagingSenderId: "457436022589",
  appId: "1:457436022589:web:f19126d5c21538aef22754",
  measurementId: "G-KK8RWL7Y0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
