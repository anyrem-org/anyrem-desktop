import { app, BrowserWindow, globalShortcut, ipcMain, type Tray } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createQuickWindows } from './quick-windows.js';
import { createTray } from './tray.js';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from './token-vault.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let quitting = false;
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#f7f8fc',
    webPreferences: {preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false},
  });
  if (!app.isPackaged) window.loadURL('http://localhost:5173');
  else window.loadFile(path.join(__dirname, '../../dist/index.html'));
  window.on('minimize', () => window.hide());
  window.on('close', (event) => { if (!quitting) { event.preventDefault(); window.hide(); } });
  return window;
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  const quick = createQuickWindows(path.join(__dirname, '../preload/index.js'), !app.isPackaged);
  const showMain = () => { if (mainWindow?.isMinimized()) mainWindow.restore(); mainWindow?.show(); mainWindow?.focus(); mainWindow?.moveTop(); };
  tray = createTray({showMain, showSearch: quick.showSearch, showCreate: quick.showCreate, quit: () => app.quit()});
  const searchShortcut = 'CommandOrControl+Alt+Space';
  const createShortcut = 'CommandOrControl+Alt+N';
  const searchRegistered = globalShortcut.register(searchShortcut, quick.showSearch);
  const createRegistered = globalShortcut.register(createShortcut, quick.showCreate);
  if (!searchRegistered) console.error('Quick Search shortcut unavailable: Ctrl/Cmd+Alt+Space is already registered.');
  if (!createRegistered) console.error('Quick Create shortcut unavailable: Ctrl/Cmd+Alt+N is already registered.');
  ipcMain.on('quick:close', (event) => BrowserWindow.fromWebContents(event.sender)?.close());
  ipcMain.on('quick:open-note', (event, id: string) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
    showMain();
    mainWindow?.webContents.send('app:navigate', `/notes/${id}`);
  });
  ipcMain.on('quick:save-note', (event) => BrowserWindow.fromWebContents(event.sender)?.close());
  ipcMain.handle('auth:refresh-token:get', () => getRefreshToken());
  ipcMain.handle('auth:refresh-token:set', (_event, token: string) => setRefreshToken(token));
  ipcMain.handle('auth:refresh-token:clear', () => clearRefreshToken());
  app.on('activate', () => { if (!mainWindow || mainWindow.isDestroyed()) mainWindow = createMainWindow(); else mainWindow.show(); });
});

app.on('before-quit', () => { quitting = true; });
app.on('will-quit', () => { globalShortcut.unregisterAll(); tray?.destroy(); tray = null; });
app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus(); });
process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());
