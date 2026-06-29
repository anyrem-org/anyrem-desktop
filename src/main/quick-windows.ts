import { BrowserWindow, screen } from "electron";
import path from "node:path";

type QuickRoute = "quick-search" | "quick-create";

function position(window: BrowserWindow) {
  const area = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint(),
  ).workArea;
  const [width] = window.getSize();
  window.setPosition(
    Math.round(area.x + (area.width - width) / 2),
    area.y + 72,
  );
}

function createQuickWindow(route: QuickRoute, preload: string, isDev: boolean) {
  let shownAt = 0;
  const window = new BrowserWindow({
    title:
      route === "quick-search"
        ? "Remember Anything — Quick Search"
        : "Remember Anything — Quick Create",
    width: 720,
    height: route === "quick-search" ? 520 : 610,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#f7f8fc",
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (isDev) window.loadURL(`http://localhost:5173/#/${route}`);
  else
    window.loadFile(path.join(path.dirname(preload), "../../dist/index.html"), {
      hash: `/${route}`,
    });
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Windows can emit blur while foreground permission is settling after a global shortcut.
  window.on("blur", () => {
    if (Date.now() - shownAt > 500) window.hide();
  });
  window.on("show", () => {
    shownAt = Date.now();
  });
  return window;
}

export function createQuickWindows(preload: string, isDev: boolean) {
  let search = createQuickWindow("quick-search", preload, isDev);
  let create = createQuickWindow("quick-create", preload, isDev);
  const show = (window: BrowserWindow) => {
    if (window.isMinimized()) window.restore();
    position(window);
    window.setAlwaysOnTop(true, "screen-saver");
    window.show();
    window.moveTop();
    window.focus();
  };
  const getSearch = () => {
    if (search.isDestroyed())
      search = createQuickWindow("quick-search", preload, isDev);
    return search;
  };
  const getCreate = () => {
    if (create.isDestroyed())
      create = createQuickWindow("quick-create", preload, isDev);
    return create;
  };
  return {
    showSearch: () => show(getSearch()),
    showCreate: () => show(getCreate()),
  };
}
