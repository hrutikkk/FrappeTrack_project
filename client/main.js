const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
app.commandLine.appendSwitch("ozone-platform", "x11");
app.commandLine.appendSwitch("disable-features", "WaylandWindowDecorations");

const Store = require("electron-store");
const store = new Store();




const path = require("path");
const fs = require("fs");
// const { takeCoverage } = require("v8");
const express = require('express')
require("dotenv").config()
const { createProxyMiddleware } = require("http-proxy-middleware");

let win;
let isTimerRunning = false; // Tracks whether the timer is active


app.whenReady().then(() => {
  const server = express();

  const isDev = !app.isPackaged;
  const distPath = isDev
    ? path.join(__dirname, "react/dist")      // dev uses this
    : path.join(app.getAppPath(), "react/dist"); // prod uses this
  const indexHtml = path.join(distPath, "index.html");

  // const iconPath = isDev
  //   ? path.join(__dirname, "assets", "unify.png")
  //   : path.join(process.resourcesPath, "assets", "unify.png"); // inside AppImage

  server.post(
    "*/api/method/frappetrack.api.user.login_with_email",
    express.json(),
    (req, res, next) => {
      let backendUrl = store.get("backendUrl");
      console.log("something went wrong ;:::: fksdjdfkjk", backendUrl)
      // If backend not configured yet, take it from request
      if (!backendUrl) {
        const { backend_url } = req.body;
        console.log(req.body)

        console.log(backendUrl)
        if (!backend_url) {
          return res.status(400).json({
            error: "backend_url required on first login",
          });
        }

        if (!backend_url.startsWith("https://")) {
          return res.status(400).json({
            error: "Invalid backend URL",
          });
        }

        store.set("backendUrl", backend_url);
        backendUrl = backend_url;

        console.log("✅ Backend configured:", backendUrl);
      }

      next();
    }
  );


  // if (proxy_url) return

  server.use(
    "/api",
    createProxyMiddleware({
      target: "http://dummy", // required but overridden
      changeOrigin: true,
      ws: true,
      router: () => {
        const url = store.get("backendUrl");
        if (!url) {
          throw new Error("Backend URL not configured");
        }
        return url;
      },
    })
  );

  server.use(express.static(distPath));

  server.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return
    res.sendFile(indexHtml);
  });
  // 0️⃣ Debug (optional)


  server.listen(5173, () => {
    win = new BrowserWindow({
      width: 1200,
      height: 1100,
      title: "Time Tracker",  // <- set your app name here
      // icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true
      }
    });

    win.loadURL(process.env.CLIENT_URL);
    // Menu.setApplicationMenu(null); // ✅ removes menu completely
    win.on("close", (e) => {
      if (isTimerRunning) {
        e.preventDefault(); // Stop the window from closing immediately

        const { dialog } = require("electron");

        const choice = dialog.showMessageBoxSync(win, {
          type: "warning",
          buttons: ["Yes, close", "Cancel"],
          defaultId: 1,
          cancelId: 1,
          title: "Confirm Exit",
          message: "The timer is running. Are you sure you want to exit?",
        });

        if (choice === 0) {
          // User confirmed exit
          isTimerRunning = false; // optional: stop timer logic here
          win.destroy(); // Force close the window
        }
      }
    });

  });
});


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

