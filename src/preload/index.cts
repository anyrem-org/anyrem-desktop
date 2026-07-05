const { contextBridge, ipcRenderer } = require("electron") as typeof import("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  closeQuickWindow: () => ipcRenderer.send("quick:close"),
  openQuickResult: (id: string) => ipcRenderer.send("quick:open-note", id),
  saveQuickNote: (note: {
    title: string;
    content: string;
    categoryIds?: string[];
    relatedIds?: string[];
  }) => ipcRenderer.send("quick:save-note", note),
  getRefreshToken: (): Promise<string | null> =>
    ipcRenderer.invoke("auth:refresh-token:get"),
  setRefreshToken: (token: string): Promise<void> =>
    ipcRenderer.invoke("auth:refresh-token:set", token),
  clearRefreshToken: (): Promise<void> =>
    ipcRenderer.invoke("auth:refresh-token:clear"),
  getShortcuts: () => ipcRenderer.invoke("shortcuts:get"),
  setShortcut: (name: "search" | "create", accelerator: string) =>
    ipcRenderer.invoke("shortcuts:set", name, accelerator),
  resetShortcuts: () => ipcRenderer.invoke("shortcuts:reset"),
  openExternal: (url: string) => ipcRenderer.invoke("shell:open-external", url),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("app:version"),
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke("updater:check"),
  installUpdate: (): Promise<void> => ipcRenderer.invoke("updater:install"),
  onUpdateStatus: (callback: (status: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, status: unknown) =>
      callback(status);
    ipcRenderer.on("app:update-status", listener);
    return () => ipcRenderer.removeListener("app:update-status", listener);
  },
  onNavigate: (callback: (path: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, path: string) =>
      callback(path);
    ipcRenderer.on("app:navigate", listener);
    return () => ipcRenderer.removeListener("app:navigate", listener);
  },
  onGoogleAuth: (callback: (code: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, code: string) =>
      callback(code);
    ipcRenderer.on("app:google-auth", listener);
    return () => ipcRenderer.removeListener("app:google-auth", listener);
  },
});
