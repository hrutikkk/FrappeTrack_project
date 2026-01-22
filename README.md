# Time Tracker Desktop App (Electron)

## What this project does
FrappeTrack is a desktop time-tracking application built using Electron, with a focus on integrating with a Frappe backend and providing a native desktop experience for tracking activities and time. The goal of the project is to create an offline-friendly desktop interface that wraps a web UI and connects efficiently to backend services.

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
