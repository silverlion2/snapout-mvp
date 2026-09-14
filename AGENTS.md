# SnapOut Project Instructions

- Read `.gemini/GEMINI.md`, `.gemini/RULES.md`, `.gemini/MEMORY.md`, and the latest dated session before changing the project.
- Read `.website-sop.yml`, run `web-sop doctor` before implementation, and run `web-sop check --mode fast` before handoff.
- Keep the product a local-only browser game. Do not add accounts, real payments, brokerage connectivity, telemetry, external messaging, or sensitive user data without explicit approval.
- Preserve the existing React/Vite architecture and deterministic game rules unless an approved product decision requires a change.
- Record product, architecture, test, release, and rollback evidence in `docs/` and `.gemini/sessions/`.
- Use an isolated D-drive worktree for integration so the intentionally dirty saved checkout at `D:\workspace\snapout-mvp` remains untouched.
