const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {


  sendLoginSuccess: (data) => ipcRenderer.send('login-success', data),

  captureScreen: (data) => ipcRenderer.invoke("capture-screen", data),

  // saveCredentials: (apiKey, apiSecret) => ipcRenderer.invoke("save-creds", {apiKey, apiSecret}),

  // getCredentials: (data) => ipcRenderer.invoke("get-creds", data),

   deleteScreenshots : ()=> {
   
    return ipcRenderer.invoke("delete-screenshot");
  },
  setTimerStatus: (status) => ipcRenderer.send("timer-status", status),
  storeBackendDomain :(data) => ipcRenderer.invoke("backend-domain",data),
  saveRunningTimer: () => ipcRenderer.invoke('save-running-timer'),
  onStopTimerSave: (callback) => {
    ipcRenderer.on("stop-timer-save", callback);
  },

  removeStopTimerSave: (callback) => {
    ipcRenderer.removeListener("stop-timer-save", callback);
  }
  
});