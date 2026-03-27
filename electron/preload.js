const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saveQRCode: (dataURL) => ipcRenderer.invoke('save-qrcode', dataURL),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectImage: () => ipcRenderer.invoke('select-image'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getMachineCode: () => ipcRenderer.invoke('get-machine-code'),
  printQRCode: (dataURL) => ipcRenderer.invoke('print-qrcode', dataURL),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  startUpdate: (data) => ipcRenderer.invoke('start-update', data),
  getCurrentVersion: () => ipcRenderer.invoke('get-current-version')
})




















