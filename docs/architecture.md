# Architecture

## Responsibilities And Data Flow

`src/gameLogic.js` remains the deterministic run engine. `src/ledgerStorage.js` owns schema validation, bounded history, summaries, and all browser-storage access. `src/SnapOutApp.jsx` hydrates once, appends after each resolved decision, reports storage health, and clears only through the storage module.

```text
player decision -> deterministic game state -> sanitized ledger record
  -> in-memory persistent-ledger state -> localStorage (best effort)
  -> summary and recent-history UI
```

## Trust Boundary And Privacy

Browser storage is untrusted input. Every loaded field is validated and normalized; unknown keys are discarded. Stored records contain a generated ID, timestamp, round, static card ticker/label, result enum, and non-negative integer amount. There are no names, accounts, free text, telemetry identifiers, cookies, or network requests.

## Failure, Recovery, And Data Loss

- Missing data yields a valid empty ledger.
- Invalid JSON or wrong schema yields an empty recoverable ledger and a visible partial-recovery warning.
- Mixed valid/invalid records retain valid entries and report how many were dropped.
- Read/write/security/quota failures switch the UI to temporary mode; gameplay continues.
- Writes are immediate after decisions and capped to the newest 40 records.
- Clear removes only the versioned SnapOut key; failure is reported without claiming success.

## Observability And Rollback

Observability is local UI state only; no telemetry is emitted. Rollback is removing the storage integration and UI; old versioned data is inert. No deployment is authorized.
