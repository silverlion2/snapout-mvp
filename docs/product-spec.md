# Product Spec: Persistent Phantom Ledger

## Problem Reframe

The current ledger proves the game loop within one run, then disappears on refresh. Returning players cannot see whether repeated practice is accumulating into a history they control.

## User Truth And Narrow Wedge

The target user wants a lightweight reflection cue, not an account, financial model, or health claim. The narrowest complete release records each in-game decision locally, summarizes the retained history, tells the user whether persistence is working, and lets them clear it.

## Explicit Exclusions

- No brokerage connection, real payment, market data, login, cloud sync, external messaging, or telemetry.
- No user-authored notes or identity fields.
- No medical framing, diagnosis, treatment language, or efficacy guarantee.
- No production deployment in this change.

## Observable Success

- A decision survives refresh when browser storage is available.
- Returning users see retained decision count, avoided-risk total, and recent history.
- Empty, loading, saved, partially recovered, unavailable, and cleared states are understandable.
- Gameplay remains usable when reads or writes fail.
- Clearing requires an explicit second action and removes only SnapOut's storage key.

## Assumptions And Stop Conditions

- `localStorage` is sufficient for a single-device MVP and may be blocked or cleared by the browser.
- History is capped to avoid unbounded device storage.
- Stop and redesign before adding identity, free text, remote sync, or claims about real-world outcomes.
