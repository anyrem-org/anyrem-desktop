import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  closeQuickWindow: () => ipcRenderer.send('quick:close'),
  openQuickResult: (id: string) => ipcRenderer.send('quick:open-note', id),
  saveQuickNote: (note: {title: string; content: string; categoryIds?: string[]; relatedIds?: string[]}) => ipcRenderer.send('quick:save-note', note),
  onNavigate: (callback: (path: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, path: string) => callback(path);
    ipcRenderer.on('app:navigate', listener);
    return () => ipcRenderer.removeListener('app:navigate', listener);
  },
});
