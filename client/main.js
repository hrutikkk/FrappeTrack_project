const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let loggedInUser = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname,'../client/react/dist/index.html'));
}

app.whenReady().then(createWindow);

// store profile + redirect
ipcMain.on('login-success', (event, data) => {
  loggedInUser = data;
//   mainWindow.loadFile('./pages/profile.html');
});

ipcMain.handle("capture-screen", async (event, { sessionId, imageIndex }) => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1280, height: 720 }
  });

  const image = sources[0].thumbnail.toPNG();

  // img/session-X path
  const imgDir = path.join(__dirname, "..", "img", `session-${sessionId}`);
  fs.mkdirSync(imgDir, { recursive: true });

  const filePath = path.join(imgDir, `image-${imageIndex}.png`);
  fs.writeFileSync(filePath, image);

  return sources[0].thumbnail.toDataURL(); // preview
});

// allow home page to read data
// ipcMain.handle('get-user-data', () => loggedInUser);