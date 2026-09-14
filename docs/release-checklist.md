# Release Checklist

This checklist governs promotion of the persistent-ledger slice to the established GitHub default branch. It does not authorize a new hosting provider, account, secret, or manual production deployment.

- Version: default-branch milestone; package version remains `0.0.0`.
- Canonical remote: `https://github.com/silverlion2/snapout-mvp.git`.
- Delivery target: existing `main`, by ordinary fast-forward only; never force-push or rewrite history.
- Known base: remote `main` was `b3628bccd08f1897e25e73a92dce22316ce66aaf` before integration.
- Feature provenance: implementation `ac16154`; reconciled feature head `99c94b3bd22deca2b266d4b1f3e9395c01602aa0`.
- Build evidence: `npm run verify` and `web-sop check --mode fast`; details and timestamps live in the dated session log.
- Security evidence: official npm production and full development-toolchain audits, focused secret scan, and trust-boundary review recorded in the dated session log. The lockfile is updated within declared package ranges when a fixed compatible transitive version exists.
- Browser evidence: critical local production-build journeys and responsive widths are recorded in the dated session log; an existing public URL is smoke-tested after default-branch push if it updates automatically.
- Missing automation: there is no dedicated typecheck or automated E2E command; these remain declared, non-hidden gaps under warning enforcement.
- Monitoring: local UI status only; the product emits no telemetry.
- Remote receipt: independently compare local `HEAD`, cached `origin/main`, and live `refs/heads/main`; store the exact final hash in the central portfolio governor records.
- Rollback: revert the default-branch milestone with a normal new commit. The versioned local-storage key then becomes inert; do not rewrite published history.
