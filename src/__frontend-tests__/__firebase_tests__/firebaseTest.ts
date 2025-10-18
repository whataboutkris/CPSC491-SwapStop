// src/__firebase_tests__/firebaseTest.ts
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY!,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.VITE_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Connect to Firestore emulator for tests
if (process.env.NODE_ENV === "test") {
  console.log("⚡ Connecting Firestore to emulator at localhost:5000q");
  connectFirestoreEmulator(db, "localhost", 5000);
}

// ✅ Only initialize App Check in non-test environments
if (process.env.NODE_ENV !== "test" && process.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("fake-key-for-demo"), // or real key in dev
    isTokenAutoRefreshEnabled: false,
  });
}

export { db };