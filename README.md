# AnyRem Desktop

A "Remember Anything" desktop app, built with **Electron + React + TypeScript + Vite**.

> Current status: only the Frontend (Electron) exists, no backend yet. The app runs on **mock data / mock API**.

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | **22.x** (LTS) | Required. See install steps below. |
| **pnpm** | **10.x** | The project's package manager (do NOT use npm/yarn). |
| **Git** | any | To clone the source. |
| OS | Windows / macOS / Linux | All supported. |

> **Important:** This project **uses `pnpm`, NOT `npm` or `yarn`**. Installing with `npm install` may break the setup. Always use `pnpm`.

---

## 2. Install Node.js 22

There are two ways. Using **nvm** is recommended so you can switch Node versions easily later.

### Option A — Using nvm (recommended)

**On Linux / macOS** (with [nvm](https://github.com/nvm-sh/nvm)):

```bash
# 1. Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. Reopen your terminal, or load nvm right now:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install and use Node 22
nvm install 22
nvm use 22

# 4. Verify
node -v   # should print v22.x.x
```

> Tip: run `nvm alias default 22` so every new terminal uses Node 22 automatically.

**On Windows** (with [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)):

```powershell
# Download nvm-setup.exe from the releases page above, install it, then open a new PowerShell:
nvm install 22
nvm use 22
node -v   # should print v22.x.x
```

### Option B — Without nvm (direct install)

- Go to https://nodejs.org → download the **LTS 22.x** build → install like a normal app.
- Or use your OS package manager:

```bash
# macOS (Homebrew)
brew install node@22

# Windows (winget)
winget install OpenJS.NodeJS.LTS

# Ubuntu/Debian (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:

```bash
node -v   # must print v22.x.x
```

---

## 3. Install pnpm

The cleanest way is to enable **Corepack** (bundled with Node 22):

```bash
corepack enable
corepack prepare pnpm@10.25.0 --activate
pnpm -v   # prints 10.x.x
```

Or install via npm:

```bash
npm install -g pnpm@10
pnpm -v
```

---

## 4. Clone the source & install dependencies

```bash
# 1. Clone
git clone <REPO_URL> anyrem-desktop
cd anyrem-desktop

# 2. (If using nvm) make sure you're on Node 22
nvm use 22

# 3. Install dependencies with pnpm
pnpm install
```

> The project declares `pnpm.onlyBuiltDependencies` for `electron` and `esbuild`, so `pnpm install` will build those two packages correctly.

---

## 5. Configure environment variables

Create a `.env` file from the example:

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Contents of `.env` (defaults point to a local backend — not needed yet since we use mocks):

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 6. Run the app (dev mode)

```bash
pnpm dev
```

This runs two things in parallel:
- **Vite** dev server for the React (renderer) part on port `5173`.
- **Electron** — waits for Vite to be ready, then builds main/preload and opens the app window.

The Electron window pops up automatically. Editing renderer code hot-reloads.

---

## 7. Other commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run the app in development mode. |
| `pnpm build` | Production build (typecheck + build renderer + build Electron). |
| `pnpm typecheck` | TypeScript type checking only. |
| `pnpm test` | Run tests with Vitest. |

---

## 8. In-app shortcuts (Quick Access)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Space` | Quick Search |
| `Ctrl/Cmd + Shift + N` | Quick Note |
| `Ctrl/Cmd + Alt + Space` | Quick Search (fallback if the main shortcut is taken by the OS/IME) |

Minimizing **hides the app to the system tray**. Right-clicking the tray icon shows a menu: Open, Quick Search, Quick Create, Quit.

---

## 9. Troubleshooting

**`node -v` doesn't print 22.x**
→ You're on the wrong Node version. Run `nvm use 22` (if using nvm), or reinstall Node 22.

**Electron reports `failed to install correctly`**
→ Remove the broken Electron package and reinstall (install scripts are already enabled in `package.json`):

```bash
rm -rf node_modules/electron
pnpm install
```

**You edited `src/main` or `src/preload` but see no changes**
→ The app might still be hidden in the tray. **Fully quit Electron** (tray menu → Quit), then run `pnpm dev` again. Changes in main/preload do NOT hot-reload like the renderer.

**Port `5173` is already in use**
→ Kill the process using that port, or close another running Vite app.

---

## 10. Main directory structure

```
src/
  main/       # Electron main process: windows, global shortcuts, tray
  preload/    # IPC bridge between main and renderer
  renderer/
    app/       # Router, app bootstrap
    layouts/   # AppShell, sidebar, header, activity panel
    features/  # auth, dashboard, search, notes, categories, graph, settings, quick-access
    shared/    # Shared UI primitives (shadcn-style)
```

Additional design docs: `remember-anything-brief.md`, `dashboard.md`, `quick-access.md`, `PROJECT_CONTEXT.md`.
