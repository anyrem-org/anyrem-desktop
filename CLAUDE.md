# CLAUDE.md

This file is for Claude / Claude Code. The full agent context lives in **[AGENTS.md](./AGENTS.md)** — read it first.

## Quick reminders

- **FE-only phase.** No backend. App runs on **mock data**. Don't build NestJS/Prisma/DB/Meilisearch/Redis/Telegram/auth-server/offline-sync.
- **pnpm only** (never npm/yarn), Node **22.x**.
- Feature-based structure under `src/renderer/features/*`. No direct API calls in components — go through `api/*.api.ts` + hooks.
- State: TanStack Query (server data) + Zustand (UI state).
- After editing `src/main` / `src/preload`: fully quit Electron (may be in tray) before re-running `pnpm dev`. Main/preload don't hot-reload.
- Before finishing: `pnpm typecheck` and `pnpm build` must pass. Update `PROJECT_CONTEXT.md` for notable changes.

## Key files

- `AGENTS.md` — full conventions & structure.
- `README.md` — setup for new devs.
- `PROJECT_CONTEXT.md` — current status & decisions.
- `remember-anything-brief.md` — full product/engineering spec.
- `dashboard.md`, `quick-access.md` — screen specs.
