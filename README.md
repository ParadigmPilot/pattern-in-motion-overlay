# Pattern in Motion overlay

Animated mnemonic overlay for the Restaurant Pattern. Renders inside the Intake Triager hosted demo (and any other consumer) by subscribing to the substrate hook contract published in [`CONTRACT.md`](./CONTRACT.md).

## What this is

The Pattern in Motion overlay is the visible half of the Restaurant Pattern's pattern-in-motion feature. The other half — the substrate — lives in `intake-triager` and emits `step_started` / `step_ended` events as the seven-state machine advances through a turn. This package contains React components that subscribe to those events and render them as motion (pin renderer, trace renderer, mode toggle, manual-mode overlay, and downstream components per `station-architecture-scoping-document.md` v1.3).

This package is genuinely detachable from `intake-triager`. It depends only on the public hook contract surface. The `/example` harness in this repo ships a self-contained mock substrate so the overlay runs without the reference implementation present.

## Quick start

```bash
npm install
npm run dev     # starts Vite; open the URL it prints
npm test        # runs Vitest (zero tests at bootstrap)
npm run lint    # runs ESLint
```

## Structure

```
pattern-in-motion-overlay/
├── src/                 # overlay components (pin · trace · mode toggle · ...)
│   └── index.js         # public API entry
├── example/             # /example harness
│   ├── index.html
│   ├── main.jsx
│   └── mock-substrate.js
├── test/
│   └── setup.js         # Vitest + Testing Library setup
├── package.json
├── vite.config.js
├── eslint.config.js
└── LICENSE
```

## License

This repository is currently published under an "All Rights Reserved" placeholder. The terminal license posture is governed by RP-BL-11 (brand-positioning ADR, scheduled Cycle 317 in [`restaurant-pattern-portfolio-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/restaurant-pattern-portfolio-scoping-document.md) §6.3 step 2). Until then, this repo is public for transparency but not yet open-source-licensed.

## Related governance

- [`CONTRACT.md`](./CONTRACT.md) — substrate consumer contract
- [`SIGNATURES.md`](./SIGNATURES.md) — per-export signatures (consumer-facing JSDoc mirror)
- [`station-architecture-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/311/station-architecture-scoping-document.md) — overlay architecture (state machine, manifest schema, component roadmap)
- [`reference-implementation-vs-overlay-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md) — separation contract (Option C Fully Detached)
- [`restaurant-pattern-portfolio-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/restaurant-pattern-portfolio-scoping-document.md) — portfolio contract
