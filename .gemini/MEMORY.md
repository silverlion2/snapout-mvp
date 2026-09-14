# Memory And State

## Milestones

- [x] Core timed SnapOut game and deterministic rule tests
- [x] Simplified Chinese player surface
- [x] Product, science-claim, and memory documentation
- [x] Persistent, clearable local phantom ledger
- [ ] Browser-level automated critical-journey tests
- [ ] Deployment setup

## Current Product State

The persistent phantom ledger is complete on the established default `main` line under the portfolio push-before-archive rule. It stores at most 40 schema-validated decisions in the user's browser, shows retained totals and recent entries, recovers valid subsets, degrades to temporary mode when storage fails, and supports a focused two-step clear flow. No accounts, backend, telemetry, external messages, or real payments.

## Next High-Value Work

- Add automated browser critical-journey coverage.
- Add a concise post-run reflection summary without real-world outcome claims.

## Repository State

- Remote: `origin` -> `https://github.com/silverlion2/snapout-mvp.git`
- Remote default branch: `origin/main`
- Integration worktree branch: `codex/persistent-ledger-main-20260915`, tracking `origin/main`
- Remote `main` before integration: `b3628bccd08f1897e25e73a92dce22316ce66aaf`
- Reconciled feature head: `99c94b3bd22deca2b266d4b1f3e9395c01602aa0`
- First integration receipt: local, cached, and live GitHub `main` all matched `93ca800a954d801141b5b7d85a92ef5ea2b37891`; the final log update is its ordinary direct child and is verified in the central governor records.
- Saved checkout at `D:\workspace\snapout-mvp` is intentionally untouched.

## Environment Notes

- `web-sop` CLI is available. The project uses warning enforcement; dedicated typecheck and automated E2E commands remain known gaps.
- Bundled Python works, but project-tracker enrichment reports this worktree is not registered.
- Token estimator finds no mapped conversations for this worktree and exits with `ZeroDivisionError`; token totals are unavailable.
