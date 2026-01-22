## /electron

Contains Electron main process and preload scripts.

- main.js  
  Creates the BrowserWindow, starts the local Express proxy,
  and handles app lifecycle.

- preload.js  
  Exposes safe APIs (IPC) to the renderer process.

- ipcHandlers.js  
  Defines IPC handlers for filesystem, auth, and app config.
