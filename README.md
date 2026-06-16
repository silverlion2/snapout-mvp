# SnapOut MVP

SnapOut is now an HTML browser game about resisting impulsive retail trades. The player faces timed FOMO cards, chooses whether to snap out or chase the trade, and tries to finish the run with cash intact and heat under control.

The current MVP is a local React/Vite game. It does not connect to brokerages, persist history, pull market data, or process payments.

## Current Product

- Eight-card arcade run themed around high-volatility trade impulses.
- Timed decisions: `Snap Out` banks the avoided loss; `Take Trade` burns cash.
- Heat meter: missed timers and chased trades push the run toward shutdown.
- Score, cash, saved amount, streak, misses, and round counters.
- Phantom ledger: records saved, lost, and frozen decisions during the run.
- Keyboard controls: `A` / `Space` to snap out, `L` / `Y` to take the trade, `R` to restart.
- Simplified Chinese player-facing UI, card copy, feedback, and HTML metadata.
- SnapOut-branded HTML metadata and favicon.

See [docs/PRODUCT_MAP.md](docs/PRODUCT_MAP.md) for the full product map and [docs/MEMORY_SYSTEM.md](docs/MEMORY_SYSTEM.md) for the project memory workflow.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 3
- Lucide React icons
- Node built-in test runner
- ESLint 9

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run lint
npm run build
```

## Project Shape

```text
src/
  App.jsx              # Mounts the SnapOut experience
  SnapOutApp.jsx       # Main game UI and interactions
  gameLogic.js         # Deterministic game rules
  gameLogic.test.js    # Node tests for game rules
  index.css            # Tailwind entrypoint and game styling
docs/
  PRODUCT_MAP.md
  MEMORY_SYSTEM.md
.gemini/
  GEMINI.md            # Local project identity for agent context
  MEMORY.md            # Local current-state summary
  RULES.md             # Local memory operating rules
  sessions/            # Local dated session logs
```

## Known Gaps

- No persistent ledger or saved high scores.
- No real risk model or market data.
- No account system or brokerage integration.
- No deployment target configured.
- Game tuning, difficulty modes, and sound are still open.

<!-- discoverability:start -->
## Discoverability

- **Project:** SnapOut MVP
- **Summary:** A browser game that trains traders to recognize FOMO, avoid impulsive retail trades, manage heat, and preserve capital through timed decision cards.
- **Primary keywords:** trading-psychology, behavioral-finance, fomo, browser-game, financial-education, retail-trading, risk-management, react, vite, javascript, vercel
- **Use cases:** Trading psychology education, FOMO and impulse-control training, Browser-based financial education game
- **Live URL:** https://snapout-mvp.vercel.app
<!-- discoverability:end -->
