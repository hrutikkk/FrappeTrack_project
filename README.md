# Time Tracker Desktop App (Electron)

## What this project does
Electron-based desktop app that wraps the Frappe backend and React frontend
to provide offline-friendly time tracking.

## Tech stack
- Electron (main + preload)
- React (renderer)
- Express (local proxy)
- Python (NLP only)

## Folder structure
- /electron       → Electron main + preload process
- /client/react   → React UI
- /server         → Local Express proxy
- /scripts        → Build / packaging scripts

## How to run (dev)
npm install
npm run dev

## How to build
npm run build:linux
npm run build:win
npm run build:mac
