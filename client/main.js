const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // preload script
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the React build
  mainWindow.loadFile(
    path.join(__dirname, "../client/react/dist/index.html")
  );

  // Optional: open DevTools for debugging
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------------- IPC for Screenshots ------------------
ipcMain.handle("capture-screen", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1280, height: 720 },
    });

    const thumbnail = sources[0].thumbnail;
    const image = thumbnail.toPNG();

    // Current date & time
    const now = new Date();
    const dateFolder = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeString = now
      .toTimeString()
      .split(" ")[0]
      .replace(/:/g, "-"); // HH-MM-SS

    // Folder: screenshots/YYYY-MM-DD/
    const imgDir = path.join(__dirname, "screenshots", dateFolder);
    fs.mkdirSync(imgDir, { recursive: true });

    // File path: screenshots/YYYY-MM-DD/HH-MM-SS.png
    const filePath = path.join(imgDir, `${timeString}.png`);
    fs.writeFileSync(filePath, image);

    return thumbnail.toDataURL(); // Send preview to renderer
  } catch (err) {
    console.error("Error capturing screen:", err);
    return null;
  }
});
