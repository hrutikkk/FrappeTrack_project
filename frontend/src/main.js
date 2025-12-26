const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true, // prevePnts white flash
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, "../src/pages/login.html"));

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Listen for login success from renderer
ipcMain.on('login-success', () => {
  win.loadFile(path.join(__dirname, "../src/pages/profile.html"));
});
