const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {


  sendLoginSuccess: (data) => ipcRenderer.send('login-success', data),

  captureScreen: (data) => ipcRenderer.invoke("capture-screen", data)
});