const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
app.commandLine.appendSwitch("ozone-platform", "x11");
app.commandLine.appendSwitch("disable-features", "WaylandWindowDecorations");


const path = require("path");
const fs = require("fs");
// const { takeCoverage } = require("v8");
const express = require('express')
require("dotenv").config()
const { createProxyMiddleware } = require("http-proxy-middleware");
const Store = require("electron-store");
const store = new Store();

// store.set("client_url","http://localhost:5173")


let win;
let isTimerRunning = false; // Tracks whether the timer is active




// let dynamicTarget = "http://192.168.0.32:8000/"; // Default fallback backend

app.whenReady().then(() => {
  const server = express();
  const rawBodySaver = (req, res, buf) => {
    if (buf && buf.length) req.rawBody = buf;
  };
  server.use(express.json({ verify: rawBodySaver }));
  // -------------------------
  // Parse JSON bodies automatically
  // -------------------------
  // server.use("/api", express.json());

  // -------------------------
  // Log API requests (optional, useful for debugging)
  // -------------------------
  server.use("/api", (req, res, next) => {
    console.log("[API REQUEST]", req.method, req.url, req.body);
    next();
  });

  // -------------------------
  // Proxy /api requests to backend
  // -------------------------
  // let dynamicTarget = "http://192.168.0.32:8000/"; // default backend

  server.use(
    "/api",
    createProxyMiddleware({
      target: "http://192.168.0.43:8000", // default backend
      changeOrigin: true,
      selfHandleResponse: false,
      pathRewrite: { "^/api": "/api" },
      router: (req) => {
        // Parse backendUrl from raw body (not req.body)
        try {
          const body = JSON.parse(req.rawBody?.toString() || "{}");
          if (body.backendUrl) {
            console.log("Redirecting to dynamic backend:", body.backendUrl);
            return body.backendUrl;
          }
        } catch (e) { }
        return "http://192.168.0.43:8000";
      },
      onProxyReq: (proxyReq, req) => {
        if (req.rawBody) {
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", req.rawBody.length);
          proxyReq.write(req.rawBody);
        }
      },
      onError: (err, req, res) => {
        console.error("Proxy error:", err.message);
        res.status(500).json({ error: err.message });
      },
    })
  );


  // -------------------------
  // Serve frontend
  // -------------------------
  const isDev = !app.isPackaged;
  const distPath = isDev
    ? path.join(__dirname, "react/dist")
    : path.join(app.getAppPath(), "react/dist");
  const indexHtml = path.join(distPath, "index.html");

  server.use(express.static(distPath));
  server.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return; // skip API
    res.sendFile(indexHtml);
  });

  // -------------------------
  // Start server
  // -------------------------
  const PORT = 5173;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    win = new BrowserWindow({
      width: 1200,
      height: 1100,
      title: "Time Tracker",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
      },
    });

    win.loadURL(`http://localhost:5173`);
    win.webContents.openDevTools();

    // Confirm close if timer is running
    win.on("close", (e) => {
      if (isTimerRunning) {
        e.preventDefault();
        const choice = dialog.showMessageBoxSync(win, {
          type: "warning",
          buttons: ["Yes, close", "Cancel"],
          defaultId: 1,
          cancelId: 1,
          title: "Confirm Exit",
          message: "The timer is running. Are you sure you want to exit?",
        });
        if (choice === 0) {
          isTimerRunning = false;
          win.destroy();
        }
      }
    });
  });
});



// -------------------------


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});



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

    console.log("Date folder: ", dateFolder, "Time string: ", timeString)

    // ✅ WRITE TO USER DATA (NOT app.asar)
    const baseDir = app.getPath("userData");
    const imgDir = path.join(baseDir, "screenshots", dateFolder);
    console.log("Basedir: ", baseDir, "imgDir: ", imgDir)
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


//delete screenshot
ipcMain.handle("delete-screenshot", async () => {
  try {
    // console.log("📥 IPC received: delete-screenshot");
    const screenshotDir = path.join(
      __dirname,
      "screenshots"
    );
    const baseDir = app.getPath("userData");
    const imgDir = path.join(baseDir, "screenshots");
    console.log("deleting this folder: ", imgDir)
    if (fs.existsSync(imgDir)) {
      fs.rmSync(imgDir, { recursive: true, force: true });
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
//dialog box
ipcMain.on("timer-status", (event, status) => {
  isTimerRunning = status; // true if running, false if stopped
});
