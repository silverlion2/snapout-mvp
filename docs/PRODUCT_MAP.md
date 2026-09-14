# SnapOut Product Map

Last updated: 2026-09-15

## Product Thesis

SnapOut turns pre-trade discipline into a short arcade loop. The player practices interrupting impulsive trades by making fast decisions under pressure, with the game rewarding avoided losses and punishing chased trades.

## Target User

- Retail trader tempted by FOMO, meme stocks, crypto, options, or high-volatility trades.
- User does not need portfolio analysis; they need immediate behavioral rehearsal.
- The MVP is a standalone browser game, not a brokerage-connected guardrail.

## Implemented Game Loop

1. Player starts an eight-card FOMO Defense run.
2. Each round presents an impulse card with ticker, trade size, drawdown risk, bait, headline, and note.
3. Player chooses `Snap Out` before the timer expires to bank the projected avoided loss.
4. Player can choose `Take Trade`, which subtracts the projected loss from cash and raises heat.
5. Letting the timer expire records a frozen decision and raises heat without changing cash.
6. The run ends in a win after eight rounds, or a loss when cash hits zero or heat reaches 100.

## Current State Machine

```text
ready
  -> playing     start run
playing
  -> playing     snap / yolo / timeout while status remains playable
  -> finished    round cap reached, cash wiped, or heat maxed
finished
  -> playing     play again / restart
```

## Current Game Rules

Rules live in `src/gameLogic.js` and are covered by `src/gameLogic.test.js`.

- Starting cash: `$10,000`.
- Starting heat: `30`.
- Max heat: `100`.
- Max rounds: `8`.
- Potential loss: `Math.round(card.amount * card.drawdown)`.
- `snap`: preserves cash, adds avoided loss to `saved`, lowers heat, increases streak and score, logs `saved`.
- `yolo`: subtracts potential loss from cash, raises heat, resets streak, increments misses, logs `lost`.
- `timeout`: leaves cash unchanged, raises heat, resets streak, increments misses, logs `froze`.

## Current Data Model

Game state is plain React state backed by deterministic helpers.

- `cash`: remaining player cash.
- `saved`: cumulative avoided loss.
- `heat`: impulse pressure meter.
- `streak`: consecutive snap decisions.
- `score`: run score.
- `misses`: chased or frozen decisions.
- `round`: completed rounds.
- `ledger`: latest run decisions used by the deterministic game state.
- `snapout.phantom-ledger.v1`: versioned browser-local history containing at most 40 sanitized decision records.
- `IMPULSE_DECK`: static card deck with ticker, amount, drawdown, bait, headline, and note.

## Persistent Ledger Flow

1. On load, SnapOut reads only its versioned local-storage key and validates every field.
2. Missing data becomes an empty ledger; valid subsets survive malformed entries with a visible recovery notice.
3. Every resolved decision is appended immediately and the newest 40 records are retained.
4. If browser storage rejects a read or write, the in-memory ledger and game remain usable in temporary mode.
5. The player can clear the ledger through a focused two-step confirmation; no other browser key is touched.

## Repository And Delivery Topology

- Canonical remote: `https://github.com/silverlion2/snapout-mvp.git`.
- Default branch: `main`.
- The ledger implementation was built as commit `ac16154` and reconciled with the then-current remote `main` at feature head `99c94b3`.
- Default-branch promotion is performed only as an ordinary fast-forward after native checks, SOP checks, dependency and secret scans, responsive browser verification, and a fresh remote-ref check.
- The saved checkout at `D:\workspace\snapout-mvp` remains intentionally untouched; integration and verification use the isolated `D:\workspace\snapout-main-integration` worktree.
- Exact post-push remote-ref evidence is retained in the central portfolio governor records because a Git commit cannot contain its own final hash.

## Product Surface

- Primary app: `src/SnapOutApp.jsx`
- Game rules: `src/gameLogic.js`
- Rule tests: `src/gameLogic.test.js`
- Local persistence boundary: `src/ledgerStorage.js`
- Persistence tests: `src/ledgerStorage.test.js`
- Entry wrapper: `src/App.jsx`
- Mount point: `src/main.jsx`
- Styling: Tailwind classes plus `src/index.css`
- HTML shell: `index.html`
- Player-facing app copy, card prompts, feedback, and HTML metadata are currently localized to Simplified Chinese.

## Debug Fixes In This Version

- Replaced stale Vite page title/favicon with SnapOut game metadata.
- Replaced the old non-persistent "Log Action to Phantom Ledger" button with an actual in-session ledger.
- Added deterministic game logic tests.
- Fixed action-button text clipping found during browser verification.

## Risks And Open Questions

- The loss estimate is a hard-coded gameplay heuristic, not financial advice or a validated risk model.
- The game loop may train hesitation, but it does not prevent real trades.
- Ledger history is limited to one browser/device and may be removed by browser privacy settings or data clearing.
- The retained totals are gameplay feedback, not evidence of real-world savings or behavior change.
- Difficulty tuning is unvalidated.
- Any future real-money, brokerage, or user-account feature needs a compliance and safety review.

## High-Leverage Next Steps

- Add a short post-run summary with the player’s most costly avoided impulse and optional best-run history.
- Add difficulty settings for timer length, heat penalties, and deck composition.
- Add sound and reduced-motion preferences.
- Add automated browser-level tests for start, snap, yolo, timeout, persistence, clear, and restart paths.
