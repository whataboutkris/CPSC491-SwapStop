// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCk3G0xLFFieISMpUhK7YjDKkCKzR547hk",
  authDomain: "swapstop-3f67f.firebaseapp.com",
  projectId: "swapstop-3f67f",
  storageBucket: "swapstop-3f67f.firebasestorage.app",
  messagingSenderId: "818089037690",
  appId: "1:818089037690:web:8178bbfe6b13ae5f8d90c3",
  measurementId: "G-3W788ZD9MR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };