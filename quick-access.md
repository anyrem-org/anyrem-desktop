## Quick access background behavior

The app should support background quick access.

When the app is running in the background, users can press global shortcuts to open lightweight overlay windows without opening the full main app.

Required shortcuts:

- Quick Search: `CommandOrControl + Space`
- Quick Create Note: `CommandOrControl + Shift + N`

Implementation direction:

- Use Electron `globalShortcut` in the main process.
- Create separate BrowserWindow instances:
  - `QuickSearchWindow`
  - `QuickCreateWindow`
- These windows should be:
  - frameless
  - always on top
  - skip taskbar
  - centered near the top of the screen
  - hidden on blur or Esc
- Do not show the full main app when opening quick search/create.
- Main app can stay hidden in tray/background.
- Quick windows should use dedicated renderer routes:
  - `/quick-search`
  - `/quick-create`
- Quick routes should use a minimal layout without sidebar/header/right panel.

UX:

- Quick Search should focus the input immediately.
- User can type keyword, use arrow keys, press Enter to open a result.
- Quick Create should allow fast note creation.
- User can press Ctrl/Cmd + Enter to save.
- Esc closes the quick window.
- Category is optional in quick create.

Security:

- Keep `nodeIntegration: false`.
- Use `contextIsolation: true`.
- Use preload + contextBridge for safe IPC.
