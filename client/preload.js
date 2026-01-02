const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
//   getProfile: async (apiKey, apiSecret) => {
//     const res = await fetch(
//       "http://192.168.0.138/api/method/frappetrack.api.user.get_employee_profile",
//       {
//         headers: {
//           'Authorization': `token ${apiKey}:${apiSecret}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     if (!res.ok) throw new Error('Unable to fetch profile');
//     return res.json();
//   },

  sendLoginSuccess: (data) => ipcRenderer.send('login-success', data),

//   getUserData: () => ipcRenderer.invoke('get-user-data'),

  captureScreen: (data) => ipcRenderer.invoke("capture-screen", data)
});