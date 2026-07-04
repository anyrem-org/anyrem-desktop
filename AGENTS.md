# AGENTS.md — AnyRem Desktop

Context for AI coding agents (Codex, Claude, Cursor, etc.) working in this repo.
Read this before making changes.

---

## What this project is

**AnyRem / "Remember Anything"** — a desktop app to quickly capture notes while working and recall them fast (Google-like search), with related content and a knowledge graph.

**Current phase: Frontend only.** No backend exists. The app runs entirely on **mock data / mock API modules**. Do NOT build backend (NestJS, Prisma, PostgreSQL, Meilisearch, Redis/BullMQ, Telegram, auth server, offline SQLite) — those are future phases.

Detailed product/engineering spec: `remember-anything-brief.md`. Screen specs: `dashboard.md`, `quick-access.md`. Living status: `PROJECT_CONTEXT.md`.

---

## Tech stack

- **Electron 41** (main / preload / renderer split)
- **React 19 + TypeScript 5 + Vite 6**
- **Tailwind CSS 3** + Radix / shadcn-style components
- **Zustand** (UI/local state) + **TanStack Query** (server state)
- **Tiptap** (rich editor) + **React Flow / @xyflow/react** (graph)
- **pnpm 10** (package manager)

---

## Commands

Use **pnpm only** (never npm/yarn). Node **22.x** required.

```bash
pnpm install       # install deps
pnpm dev           # Vite (5173) + Electron in parallel
pnpm build         # tsc -b + vite build + build electron
pnpm typecheck     # tsc -b, no emit
pnpm test          # vitest run
```

Setup details for new devs are in `README.md`.

---

## Directory structure

```
src/
  main/        # Electron main: windows, global shortcuts, tray, token vault
  preload/     # IPC bridge (contextBridge)
  renderer/
    app/         # App.tsx, router, providers
    layouts/     # AppShell, Sidebar, TopHeader, ActivityPanel
    features/    # feature-based modules (see below)
    shared/      # ui primitives, hooks, lib, store, types
```

`features/` modules: `auth`, `dashboard`, `search`, `notes`, `categories`, `graph`, `settings`, `quick-access`, `activity`, `avatars`, `uploads`.

Each feature typically has: `components/`, `hooks/`, `api/`, `types/`, `pages/`.

---

## Conventions (follow these)

- **Feature-based structure.** Keep code inside its feature folder. No giant files.
- **No direct API calls in components.** Call through `features/*/api/*.api.ts`, consume via hooks (`useNotes`, `useSearch`, ...).
- **No business logic inside JSX.**
- **Mock data lives in api/mock modules** (e.g. `categories.mock.ts`), never hardcoded inside components.
- **State:** TanStack Query for server-ish data, Zustand for UI state (sidebar, panels, modals, theme). Don't duplicate server data into Zustand.
- **TypeScript:** proper types, avoid `any` unless necessary.
- **UI:** shadcn-style primitives in `shared/components/ui`; Tailwind for layout. Light theme, clean/minimal, soft blue/purple accent.
- **Electron security:** keep main/preload/renderer separated; use preload + contextBridge; don't enable `nodeIntegration` in renderer unless needed.
- Principles: KISS, DRY, YAGNI, separation of concerns, small focused components. Don't over-engineer.

---

## Electron gotchas

- After editing `src/main` or `src/preload`, **fully quit Electron** (it may be hidden in the tray → tray menu → Quit) before `pnpm dev` again. Main/preload do NOT hot-reload; only the renderer does.
- If Electron reports `failed to install correctly`: `rm -rf node_modules/electron && pnpm install`. `pnpm.onlyBuiltDependencies` already covers `electron` and `esbuild`.
- Minimize hides the app to the system tray (Open / Quick Search / Quick Create / Quit).

## Global shortcuts

- `Ctrl/Cmd+Space` → Quick Search
- `Ctrl/Cmd+Shift+N` → Quick Note
- `Ctrl/Cmd+Alt+Space` → Quick Search fallback (if main is taken by OS/IME)

---

## Before finishing a change

1. `pnpm typecheck` must pass.
2. `pnpm build` should pass (bundle ~1MB warning is known/acceptable in the mock FE phase).
3. Keep changes within current scope: **FE + mocks only**, don't introduce backend or real network calls.
4. Update `PROJECT_CONTEXT.md` if you change architecture or notable behavior.
