# Time Tracker Desktop App (Electron)

## What this project does
FrappeTrack is a desktop time-tracking application built using Electron, with a focus on integrating with a Frappe backend and providing a native desktop experience for tracking activities and time. The goal of the project is to create an offline-friendly desktop interface that wraps a web UI and connects efficiently to backend services.

## Download zip for your OS
[Mac](https://github.com/suraj-ufx/FrappeTrack/actions/runs/21506932799)  
[Linux](https://github.com/suraj-ufx/FrappeTrack/actions/runs/21506932797)  
[Windows](https://github.com/suraj-ufx/FrappeTrack/actions/runs/21506932801)

## there might be future pushes you can checkout those

## Tech stack
- Electron (main + preload)
- React (renderer)
- Express (local proxy)

## Folder structure
```text
FrappeTrack/
├─ .github/
│  └─ workflows/             ← GitHub Actions workflows (CI configs for building macOS DMG, Windows EXE, etc.)
│
├─ client/                   ← Main application source (Electron + frontend integration)
│  ├─ main.js                ← Electron main process entry point; creates the app window and loads the UI
│  │
│  ├─ react/                 ← React frontend project
│  │  ├─ dist/               ← Production build output (dist/index.html loaded by Electron)
│  │  ├─ src/                ← React source code (components, pages, hooks, etc.)
│  │  └─ package.json        ← React app dependencies and scripts
│  │
│  └─ README.md              ← Client-specific documentation (Electron + frontend setup notes)
│
├─ package.json              ← Root project scripts and dependencies (Electron, build tooling, etc.)
├─ package-lock.json         ← Locked dependency versions for reproducible builds
└─ README.md                 ← High-level project documentation
```

## How to run (dev)
npm install
npm run dev

## How to build
npm run build:linux
npm run build:win
npm run build:mac

## 📁 api/

Handles **all HTTP and backend communication**.

### `axiosinstance.js`
- Centralized Axios configuration
- Sets base URL (`/api`), headers, and credentials
- Ensures consistent API usage across the app
---

## 📁 components/

Reusable **UI and routing components**.

### `ProtectedRoutes.js`
- Restricts access to authenticated users
- Redirects unauthenticated users to login

### `sidebar.jsx`
- Main navigation sidebar
- Provides consistent layout across protected pages

---
## 📁 pages/

Contains **route-level React components** (screens).

### `login.jsx`
- User authentication screen
- Handles login flow and session initialization

### `profile.jsx`
- Displays logged-in user information
- Provides profile-related actions

### `tracker.jsx`
- Core time tracking screen
- Controls start, pause, resume, and stop actions
- Integrates timer, projects, and screenshots

---
## 📁 store/

Manages **global application state** using Zustand.

### `authstore.js`
- Handles authentication state
- Stores user and session data

### `createstore.js`
- Manages project-related data
- Fetches and stores assigned projects

### `timestore.js`
- Contains all timer logic
- Tracks session time and pause durations

### `screenshotstore.js`
- Captures and uploads screenshots
- Attaches metadata like time and project

---
