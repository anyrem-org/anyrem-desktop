import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type UpdateStatus =
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

export function setupAutoUpdater(getWindow: () => BrowserWindow | null) {
  const notify = (payload: UpdateStatus) => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return;
    window.webContents.send("app:update-status", payload);
  };

  if (!app.isPackaged) {
    ipcMain.handle("updater:check", async () => ({
      status: "not-available" as const,
      dev: true,
    }));
    ipcMain.handle("updater:install", async () => undefined);
    return;
  }

  const { autoUpdater } = require("electron-updater") as typeof import("electron-updater");
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => notify({ status: "checking" }));
  autoUpdater.on("update-available", (info) =>
    notify({ status: "available", version: info.version }),
  );
  autoUpdater.on("update-not-available", () =>
    notify({ status: "not-available" }),
  );
  autoUpdater.on("download-progress", (progress) =>
    notify({ status: "downloading", percent: progress.percent }),
  );
  autoUpdater.on("update-downloaded", (info) => {
    notify({ status: "downloaded", version: info.version });
    void dialog
      .showMessageBox({
        type: "info",
        title: "Update ready",
        message: `AnyRem ${info.version} is ready to install.`,
        detail: "Restart the app to finish updating.",
        buttons: ["Restart now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });
  autoUpdater.on("error", (error: Error) =>
    notify({ status: "error", message: error.message }),
  );

  ipcMain.handle("updater:check", async () => {
    await autoUpdater.checkForUpdates();
  });
  ipcMain.handle("updater:install", async () => {
    autoUpdater.quitAndInstall();
  });

  setTimeout(() => {
    void autoUpdater.checkForUpdates();
  }, 12_000);
}
