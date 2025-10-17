//Used firebase emulator to mock and to test our connection with our app. 

// To test yourself:

//1.Install Firebase CLI
    //npm install -g firebase-tools Install Firebase CLI

//2. Initialize the emulator
    //firebase init emulators Initialize the emulator

//3.Choose Firestore 
    //firebase emulators:start --only firestore Choose 

//4. Run "npx vitest"



import { describe, it, expect } from "vitest";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../__firebase_tests__/firebaseTest";

describe("Firebase App Check (Debug) tests", () => {
  it("Can write and read a document", async () => {
    console.log("🧪 inside test block");
    const ref = doc(db, "testCollection", "debugTest");
    const data = { message: "App Check debug success", timestamp: Date.now() };

    await setDoc(ref, data);
    const snap = await getDoc(ref);

    expect(snap.exists()).toBe(true);
    expect(snap.data()).toMatchObject({ message: "App Check debug success" });
  }, 10_000);
});