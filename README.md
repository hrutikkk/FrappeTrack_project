# Time Tracker Desktop App (Electron)

## What this project does
FrappeTrack is a desktop time-tracking application built using Electron, with a focus on integrating with a Frappe backend and providing a native desktop experience for tracking activities and time. The goal of the project is to create an offline-friendly desktop interface that wraps a web UI and connects efficiently to backend services.

## Tech stack
- Electron (main + preload)
- React (renderer)
- Express (local proxy)

## Folder structure
├─FrappeTrack/
  ├─ .github/                 ← GitHub workflows (CI configs for mac dmg creation)
  ├─ client/                  ← main.js (entry point of the frontend)
    ├─react                   ← using dist/index.html file in main.js
    ├─ README.md
  ├─ package-lock.json        ← noted version, build of client, react and build for different OS


## How to run (dev)
npm install
npm run dev

## How to build
npm run build:linux
npm run build:win
npm run build:mac
