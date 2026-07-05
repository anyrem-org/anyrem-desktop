# CLAUDE.md

This file is for Claude / Claude Code. The full agent context lives in **[AGENTS.md](./AGENTS.md)** — read it first.

## Quick reminders

- **Electron desktop + NestJS backend** (`../anyrem-be`). Real API via `VITE_API_URL`, no mock data in feature code.
- **pnpm only** (never npm/yarn), Node **22.x**.
- Feature-based structure under `src/renderer/features/*`. No direct API calls in components — go through `api/*.api.ts` + hooks.
- State: TanStack Query (server data) + Zustand (UI state).
- After editing `src/main` / `src/preload`: fully quit Electron (may be in tray) before re-running `pnpm dev`. Main/preload don't hot-reload.
- Before finishing: `pnpm typecheck` and `pnpm build` must pass.

## Key files

- `AGENTS.md` — full conventions & structure.
- `README.md` — setup for new devs.
- `remember-anything-brief.md` — full product/engineering spec.
- `dashboard.md`, `quick-access.md` — screen specs.
