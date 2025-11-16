# React App — Build, Offline Preview, and Deploy with Firebase

This guide shows our team how to:
- Build the React app for production
- Preview it **offline** (locally) before pushing to GitHub
- Deploy to Firebase Hosting
- Use GitHub Actions for PR (pull request) previews and automatic deploys on merge

> Works for Create React App and Vite. Adjust the **public directory** to `build/` (CRA) or `dist/` (Vite).

---

## TLDR To Build and Deploy on Firebase/
## Must Sign Onto Firebase See Below
##

1. Build Code First Command

npm run build

2. You can Test Offline Before Firebase Deploy Command
# First time: may prompt to set up emulators
# Will show local URL

firebase emulators:start --only hosting

OR LOCALLY

firebase hosting:channel:deploy dev

3. Manual Command Deploy to Firebase/Updates Live Site 

Firebase deploy

4. Pushing to Github/Merging to Main will Auto-Deploy, Set-up with Github Actions via Command Line

cd /path/to/your/project

git add .

git commit -m "Your descriptive commit message here"

git push origin <branch_name>

(Replace <branch_name> with the name of the branch you are pushing to, e.g., main or master.)

5. If using Github Desktop, once your branch is Pushed, a Pull Request
will be made, and when Merged, GitHub Actions should Auto-Deploy to Firebase

##
##
##

## Prerequisites Version Usage

- **Node.js** 18+ (we pin Node 20 in CI). Consider using an `.nvmrc` file:
  ```command/ Node.js
  node -v   ## 24.8.0
  npm -v    ## 11.6.0
  ```

## Ensure you install Firebase Tools into your Command Line Console

- **Firebase CLI**:
  ```bash/Command
  1. npm install -g firebase-tools
  
  2. firebase login
  ```
- Access to our Firebase project (ask Juan to add you if needed).
- should have access with you email

---

## Project Scripts -> npm run -----

Common scripts (from `package.json`):
```json
{
  "scripts": {
    "start": "react-scripts start",         // or "vite"
    "build": "react-scripts build",         // or "vite build"
    "preview": "vite preview",              // Vite only
    "serve": "firebase emulators:start"     // See Offline Preview below
  }
}
```

> For CRA, you won’t have `vite preview`; that’s fine—use the Firebase emulator preview steps below.

---

## One-Time Firebase Hosting Setup (already completed for this repo)

Our `firebase.json` should look like this (Vite example):
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
---

## Build for Production

From the project root:
```bash
# Clean, reproducible install
npm ci

# Build production assets
npm run build   # CRA -> build/, Vite -> dist/
```

**Yarn**
```bash
yarn install --frozen-lockfile
yarn build
```

---

## Offline Preview (Local) Before Deployment Comman

### Option A — Firebase Emulator (recommended)
This serves exactly like Hosting would, including SPA rewrites.
```bash
# First time: may prompt to set up emulators
firebase emulators:start --only hosting
```
Then open the local URL it prints (usually `http://127.0.0.1:5000`).  
> Make sure you’ve built first (`npm run build` / `vite build`).

### Option B — Vite Preview (Vite only)
```bash
npm run build
npm run preview    # serves dist/ locally
```

---

## Deploy to Firebase (Manual)

firebase deploy --only hosting
```
The CLI returns a **Hosting URL**. Open it to verify.

---

## GitHub Actions CI/CD

We use two workflows (filenames may vary):
- `.github/workflows/firebase-hosting-pull-request.yml`
  - Runs on **PRs** → builds and deploys a **Preview Channel**
  - GitHub comments with a unique preview URL (e.g., `https://<channel>--<site>.web.app`)
- `.github/workflows/firebase-hosting-merge.yml`
  - Runs on **push to `main`** → builds and deploys **live** site

**What to expect:**
1. Open/Update a PR → GitHub **Actions** runs → PR comment has preview link.
2. Merge to `main` → GitHub **Actions** runs → live site updates automatically (enabled).


## SPA (Single-Page App) Behavior

We must rewrite all routes to `index.html` so client-side routing works:
```json
"rewrites": [{ "source": "**", "destination": "/index.html" }]
```
Verify by reloading a deep link like `/settings`—it should still render, not 404.

---

## Troubleshooting

- **I see the Firebase default page**  
  `firebase.json` is pointing to `public/`. Change to `build/` (CRA) or `dist/` (Vite), rebuild, redeploy.

- **404 on refresh for non-root routes**  
  Missing SPA rewrite. Ensure the `rewrites` rule above exists.

- **Wrong project/site deployed**  
  Check active project:
  ```bash
  firebase projects:list
  firebase use <your-project-id>
  ```

- **Workflows not running**  
  - Check `.github/workflows` files exist on the default branch.
  - GitHub → Settings → Actions → Enabled for the repo.
  - Org/repo might need the **Firebase Hosting GitHub App** approved by an admin.

- **Node version mismatch**  
  Pin Node in CI:
  ```yaml
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
  ```
  Optionally add `"engines": {"node": ">=18"}` to `package.json` and an `.nvmrc`.

- **Caching/old assets/ Your View is still displaying default or old data**  
  Try hard refresh (Ctrl/Cmd+Shift+R) or open in a private window.

---

## Quick Checklist

- [ ] `firebase.json` → `"public": "build"` (CRA) or `"public": "dist"` (Vite)
- [ ] `rewrites` → SPA rule present
- [ ] `npm ci && npm run build` completes without errors
- [ ] Offline preview OK (emulator or Vite preview)
- [ ] PR creates a Preview Channel URL in GitHub
- [ ] Merge to `main` deploys the live site (if enabled)

---

## Useful Commands

```bash
# Build & preview locally with Firebase emulator

firebase emulators:start --only hosting

# Manual deploy to live

firebase deploy --only hosting

# Switch/project info
firebase projects:list
firebase use <project-id>
```
