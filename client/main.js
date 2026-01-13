const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
app.commandLine.appendSwitch("ozone-platform", "x11");
app.commandLine.appendSwitch("disable-features", "WaylandWindowDecorations");


const path = require("path");
const fs = require("fs");
// const { takeCoverage } = require("v8");
const express = require('express')
const { createProxyMiddleware } = require("http-proxy-middleware");

let win;

app.whenReady().then(() => {
  const server = express();

  const isDev = !app.isPackaged;
  const distPath = isDev
    ? path.join(__dirname, "react/dist")      // dev uses this
    : path.join(app.getAppPath(), "react/dist"); // prod uses this
  const indexHtml = path.join(distPath, "index.html");

  const iconPath = isDev
    ? path.join(__dirname, "assets", "unify.png")
    : path.join(process.resourcesPath, "assets", "unify.png"); // inside AppImage

  server.use(
    "/api",
    createProxyMiddleware({
      target: "http://192.168.0.32:8000",
      changeOrigin: true,
      ws: true,
    })
  );

  server.use(express.static(distPath));

  server.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return;
    res.sendFile(indexHtml);
  });

  server.listen(5173, () => {
    win = new BrowserWindow({
      width: 1200,
      height: 1100,
      title: "Time Tracker",  // <- set your app name here
      icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true
      }
    });

    win.loadURL("http://localhost:5173");
  });
});

// app.whenReady().then(() => {
//   const server = express();

//   // const distPath = path.join(__dirname, "react/dist");
//   const distPath = path.join(__dirname, "client", "react", "dist");

//   const indexHtml = path.join(distPath, "index.html");

//   server.use(
//     "/api",
//     createProxyMiddleware({
//       target: "http://192.168.0.32:8000",
//       changeOrigin: true,
//       ws: true,

//     })
//   );
//   // 1️⃣ Serve static files FIRST
//   server.use(express.static(distPath));

//   // 2️⃣ SPA fallback LAST (ONLY for routes)

//   // server.use((req, res, next) => {
//   //   if (req.path.startsWith("/api")) {
//   //     return next();
//   //   }
//   //   res.sendFile(indexHtml);
//   // });
//   server.get("*", (req, res) => {
//     if (req.path.startsWith("/api")) return;
//     res.sendFile(indexHtml);
//   });

//   server.listen(5173, () => {
//     win = new BrowserWindow({
//       width: 1200,             // mobile width
//       height: 1100,            // mobile height
//       minWidth: 320,           // optional min/max to prevent too small

//       maxHeight: 1024,
//       center: true,
//       resizable: true,        // can be false if you want fixed size
//       webPreferences: {
//         preload: path.join(__dirname, "preload.js"),
//         nodeIntegration: false,
//         contextIsolation: true,
//       },
//     });

//     win.loadURL("http://localhost:5173");
//   });
// });
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------------- IPC for Screenshots ------------------
// ipcMain.handle("capture-screen", async () => {
//   try {
//     const sources = await desktopCapturer.getSources({
//       types: ["screen"],
//       thumbnailSize: { width: 1280, height: 720 },
//     });

//     const thumbnail = sources[0].thumbnail;
//     const image = thumbnail.toPNG();

//     // Current date & time
//     const now = new Date();
//     const dateFolder = now.toISOString().split("T")[0]; // YYYY-MM-DD
//     const timeString = now
//       .toTimeString()
//       .split(" ")[0]
//       .replace(/:/g, "-"); // HH-MM-SS

//     // Folder: screenshots/YYYY-MM-DD/
//     const imgDir = path.join(__dirname, "screenshots", dateFolder);
//     fs.mkdirSync(imgDir, { recursive: true });

//     // File path: screenshots/YYYY-MM-DD/HH-MM-SS.png
//     const filePath = path.join(imgDir, `${timeString}.png`);
//     fs.writeFileSync(filePath, image);

//     return {
//       "thumbnail": thumbnail.toDataURL(),
//       "screenshotTime": timeString
//     }; // Send preview to renderer
//   } catch (err) {
//     console.error("Error capturing screen:", err);
//     return null;
//   }
// });

ipcMain.handle("capture-screen", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1280, height: 720 },
    });

    if (!sources.length) {
      throw new Error("No screen sources found");
    }

    const thumbnail = sources[0].thumbnail;
    const image = thumbnail.toPNG();

    const now = new Date();
    const dateFolder = now.toISOString().split("T")[0];
    const timeString = now.toTimeString().split(" ")[0].replace(/:/g, "-");

    // ✅ WRITE TO USER DATA (NOT app.asar)
    const baseDir = app.getPath("userData");
    const imgDir = path.join(baseDir, "screenshots", dateFolder);

    fs.mkdirSync(imgDir, { recursive: true });

    const filePath = path.join(imgDir, `${timeString}.png`);
    fs.writeFileSync(filePath, image);

    return {
      thumbnail: thumbnail.toDataURL(),
      screenshotTime: timeString,
      savedAt: filePath,
    };
  } catch (err) {
    console.error("Error capturing screen:", err);
    return { error: err.message };
  }
});

// ipcMain.handle("save-creds", async (event, apiKey, apiSecret) => {
//   try {
//     console.log("saving creds", apiKey, apiSecret)
//     store.set("creds", { apiKey, apiSecret })
//     return true
//   } catch (error) {
//     console.error("Error saving credentials:", error);
//     return null;
//   }
// })

// ipcMain.handle("get-creds", async (event, data) => {
//   try {
//     const creds = store.get("creds");
//     console.log(creds);

//     return creds
//   } catch (error) {
//     console.error("Error fetching credentials ipc:", error);
//     return null;
//   }
// })
//delete screenshot
ipcMain.handle("delete-screenshot", async () => {
  try {
    // console.log("📥 IPC received: delete-screenshot");
    const screenshotDir = path.join(
      __dirname,
      "screenshots"
    );

    if (fs.existsSync(screenshotDir)) {
      fs.rmSync(screenshotDir, { recursive: true, force: true });
      console.log("Screenshot folder deleted");
    } else {
      console.log("Screenshot folder not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting screenshot folder:", error);
    return { success: false, error: error.message };
  }
});
