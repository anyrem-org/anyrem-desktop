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
  onNavigate: (callback: (path: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, path: string) =>
      callback(path);
    ipcRenderer.on("app:navigate", listener);
    return () => ipcRenderer.removeListener("app:navigate", listener);
  },
});
