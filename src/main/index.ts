import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  type Tray,
} from "electron";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createQuickWindows } from "./quick-windows.js";
import { createTray } from "./tray.js";
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from "./token-vault.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let quitting = false;
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();

// On Wayland, global shortcuts only work through the XDG GlobalShortcuts portal
// and the native Wayland backend. Under XWayland (X11), GNOME refuses global key
// grabs, so register() always fails. See electron/electron#51875.
if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-features", "GlobalShortcutsPortal");
  if (process.env.WAYLAND_DISPLAY)
    app.commandLine.appendSwitch("ozone-platform", "wayland");
  app.setName("anyrem-desktop");
}

type ShortcutName = "search" | "create";
type QuickShortcuts = Record<ShortcutName, string>;

const defaultShortcuts: QuickShortcuts = {
  search: "CommandOrControl+Alt+Space",
  create: "CommandOrControl+Alt+N",
};
let quickShortcuts = defaultShortcuts;
let shortcutHandlers: Record<ShortcutName, () => void>;
let shortcutStatus: Record<ShortcutName, boolean> = {
  search: false,
  create: false,
};

const shortcutPath = () =>
  path.join(app.getPath("userData"), "quick-shortcuts.json");

const loadShortcuts = () => {
  try {
    quickShortcuts = {
      ...defaultShortcuts,
      ...JSON.parse(fs.readFileSync(shortcutPath(), "utf8")),
    };
  } catch {
    quickShortcuts = defaultShortcuts;
  }
};

const saveShortcuts = () =>
  fs.writeFileSync(shortcutPath(), JSON.stringify(quickShortcuts, null, 2));

const registerShortcut = (
  name: ShortcutName,
  accelerator = quickShortcuts[name],
) => {
  if (shortcutStatus[name]) globalShortcut.unregister(quickShortcuts[name]);
  let registered = false;
  try {
    registered = globalShortcut.register(accelerator, shortcutHandlers[name]);
    // On Wayland the portal may bind asynchronously and return false on the
    // first call; isRegistered() reflects the actual state more reliably.
    if (!registered) registered = globalShortcut.isRegistered(accelerator);
  } catch (error) {
    console.error(`Failed to register ${accelerator}:`, error);
    registered = false;
  }
  shortcutStatus[name] = registered;
  if (registered) quickShortcuts = { ...quickShortcuts, [name]: accelerator };
  return registered;
};

const shortcutPayload = () => ({
  shortcuts: quickShortcuts,
  registered: shortcutStatus,
});

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: "#f7f8fc",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (!app.isPackaged) window.loadURL("http://localhost:5173");
  else window.loadFile(path.join(__dirname, "../../dist/index.html"));
  window.on("minimize", () => window.hide());
  window.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      window.hide();
    }
  });
  return window;
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  const quick = createQuickWindows(
    path.join(__dirname, "../preload/index.cjs"),
    !app.isPackaged,
  );
  const showMain = () => {
    if (mainWindow?.isMinimized()) mainWindow.restore();
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.moveTop();
  };
  tray = createTray({
    showMain,
    showSearch: quick.showSearch,
    showCreate: quick.showCreate,
    quit: () => app.quit(),
  });
  shortcutHandlers = { search: quick.showSearch, create: quick.showCreate };
  loadShortcuts();
  const searchRegistered = registerShortcut("search");
  const createRegistered = registerShortcut("create");
  console.log(
    `[shortcuts] search=${searchRegistered} (${quickShortcuts.search}) create=${createRegistered} (${quickShortcuts.create})`,
  );
  ipcMain.on("quick:close", (event) =>
    BrowserWindow.fromWebContents(event.sender)?.close(),
  );
  ipcMain.on("quick:open-note", (event, id: string) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
    showMain();
    mainWindow?.webContents.send("app:navigate", `/notes/${id}`);
  });
  ipcMain.on("quick:save-note", (event) =>
    BrowserWindow.fromWebContents(event.sender)?.close(),
  );
  ipcMain.handle("auth:refresh-token:get", () => getRefreshToken());
  ipcMain.handle("auth:refresh-token:set", (_event, token: string) =>
    setRefreshToken(token),
  );
  ipcMain.handle("auth:refresh-token:clear", () => clearRefreshToken());
  ipcMain.handle("shortcuts:get", () => shortcutPayload());
  ipcMain.handle(
    "shortcuts:set",
    (_event, name: ShortcutName, accelerator: string) => {
      const previous = quickShortcuts[name];
      const ok = registerShortcut(name, accelerator);
      if (ok) {
        saveShortcuts();
        return { ...shortcutPayload(), ok: true, pending: false };
      }
      // Wayland's portal may confirm the binding asynchronously, so a false
      // result isn't a reliable "already used" signal. Persist the choice and
      // let the UI show a soft note instead of an error.
      if (process.platform === "linux") {
        quickShortcuts = { ...quickShortcuts, [name]: accelerator };
        saveShortcuts();
        return { ...shortcutPayload(), ok: true, pending: true };
      }
      // Windows/macOS: the combo is genuinely taken; roll back.
      registerShortcut(name, previous);
      return { ...shortcutPayload(), ok: false, pending: false };
    },
  );
  ipcMain.handle("shortcuts:reset", () => {
    (Object.keys(quickShortcuts) as ShortcutName[]).forEach((name) => {
      if (shortcutStatus[name]) globalShortcut.unregister(quickShortcuts[name]);
      shortcutStatus[name] = false;
    });
    quickShortcuts = defaultShortcuts;
    registerShortcut("search");
    registerShortcut("create");
    saveShortcuts();
    return shortcutPayload();
  });
  app.on("activate", () => {
    if (!mainWindow || mainWindow.isDestroyed())
      mainWindow = createMainWindow();
    else mainWindow.show();
  });
});

app.on("before-quit", () => {
  quitting = true;
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  tray?.destroy();
  tray = null;
});
app.on("second-instance", () => {
  mainWindow?.show();
  mainWindow?.focus();
});
process.on("SIGINT", () => app.quit());
process.on("SIGTERM", () => app.quit());
