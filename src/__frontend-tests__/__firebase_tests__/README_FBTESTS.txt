Used firebase emulator to mock and to test our connection with our app. 

To run the emulator so tests work:

1.Install Firebase CLI
    //npm install -g firebase-tools Install Firebase CLI

2. Initialize the emulator
    //firebase init emulators

3.Choose Firestore 
    //firebase emulators:start --only firestore 

4. Run "npx vitest" IN A DIFFERENT TERMINAL, the firestore emulator takes up one 