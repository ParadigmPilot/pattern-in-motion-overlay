# CLAUDE.md — pattern-in-motion-overlay

Repository-root configuration consumed by Claude Code at every session.

## Build

- Install: `npm install`
- Dev server: `npm run dev` (Vite serves `/example`)
- Build: `npm run build`
- Lint: `npm run lint`

## Test

- Run once: `npm test`
- Watch mode: `npm run test:watch`
- Runner: Vitest with jsdom environment + Testing Library

## Commit conventions

- All commits use `--no-verify` (parity with hopper / intake-triager — D27).
- Conventional Commits style: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Reference the governing WO in the commit body when applicable.

## Branch + PR

- Branch from `main`: `build/{cycle}.{session}{letter}-{short-name}`
- All work merges via PR (D13: owner-merged only).

## Governance dependencies (read-only references)

- Substrate contract: `intake-triager/src/substrate/HOOK_CONTRACT.md`
- Architecture: hopper `products/hopper/project-management/cycles/311/station-architecture-scoping-document.md`
- Separation contract: hopper `products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md`
- Portfolio contract: hopper `products/hopper/project-management/cycles/313/restaurant-pattern-portfolio-scoping-document.md`
