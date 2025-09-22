# SwapStop

SwapStop is a web application built for the **CPSC 491 Senior Capstone Project** by Juan Cisneroes, Bryant Martinez, and Kristian Losenara.  
It enables users to swap, share, or trade [items/services — fill in the exact domain] using a **React + TypeScript** frontend with **Firebase** integration for hosting and backend services.

---

## ✨ Features

- Responsive UI built with **React** + **TypeScript**
- Fast builds and hot-reload with **Vite**
- **Firebase** integration for hosting, data, and authentication (if applicable)
- Type safety with **TypeScript**
- Code linting with **ESLint**

---

## 🛠 Tech Stack

- React  
- TypeScript  
- Vite  
- Firebase (Hosting, Firestore/RealtimeDB, Auth, etc.)  

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/whataboutkris/CPSC491-SwapStop.git
cd CPSC491-SwapStop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

- Install the Firebase CLI if not already installed:

  ```bash
  npm install -g firebase-tools
  ```

- Log in to Firebase:

  ```bash
  firebase login
  ```

- Ensure you have access to the Firebase project defined in `.firebaserc`.

- The app uses environment variables (e.g. API keys), create a `.env` file in the project root and add them:

  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```

*(adjust variable names based on your `src/firebase.ts` config file)*

### 4. Run the development server

```bash
npm run dev
```

By default, the app should be available at:

```
http://localhost:5173/
```

### 5. Build for production

```bash
npm run build
```

### 6. Deploy (via Firebase Hosting)

```bash
firebase use <your-firebase-project>
firebase deploy
```

### 7. Testing
There are automatic test cases that can be run using
```bash
npx vitest
```

---

## 📂 Project Structure

```plaintext
CPSC491-SwapStop/
├── public/             # Static assets
├── src/                # React + TypeScript source code
│   ├── components/     # Reusable UI components
│   ├── pages/          # App pages / routes
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── .firebaserc         # Firebase project aliases
├── firebase.json       # Firebase hosting/functions config
├── vite.config.ts      # Vite configuration
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript configuration
└── eslint.config.js    # Linting rules
```

---

## 📜 Scripts

The following commands are available in `package.json`:

- `npm run dev` → Start development server
- `npm run build` → Build production bundle
- `npm run preview` → Preview production build locally
- `firebase deploy` → Deploy app to Firebase Hosting

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/YourFeature`  
3. Commit changes: `git commit -m "Add YourFeature"`  
4. Push to branch: `git push origin feature/YourFeature`  
5. Create a Pull Request  

---
