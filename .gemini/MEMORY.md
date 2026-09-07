# Memory And State

## Milestones

- [x] Core timed SnapOut game and deterministic rule tests
- [x] Simplified Chinese player surface
- [x] Product, science-claim, and memory documentation
- [x] Persistent, clearable local phantom ledger
- [ ] Browser-level automated critical-journey tests
- [ ] Deployment setup

## Current Product State

The persistent phantom ledger is complete on `codex/persistent-phantom-ledger`. It stores at most 40 schema-validated decisions in the user's browser, shows retained totals and recent entries, recovers valid subsets, degrades to temporary mode when storage fails, and supports a focused two-step clear flow. No accounts, backend, telemetry, external messages, or real payments.

## Next High-Value Work

- Add automated browser critical-journey coverage.
- Add a concise post-run reflection summary without real-world outcome claims.

## Repository State

- Remote: `origin` -> `https://github.com/silverlion2/snapout-mvp.git`
- Remote default branch: `origin/main`
- Work branch: `codex/persistent-phantom-ledger`
- Base at session start: `7f4c46b feat: upgrade chinese version`
- Saved checkout at `D:\workspace\snapout-mvp` is intentionally untouched.

## Environment Notes

- `web-sop` CLI is unavailable; use documented equivalent gates and record the gap.
- Bundled Python works, but project-tracker enrichment reports this worktree is not registered.
- Token estimator finds no mapped conversations for this worktree and exits with `ZeroDivisionError`; token totals are unavailable.
