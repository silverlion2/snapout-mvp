# SnapOut MVP

## Architecture And Objective

- Name: SnapOut MVP
- Source: standalone Git worktree
- Tech stack: React, Vite, Tailwind CSS, Lucide React
- Tracked since: 2026-03-18

## Description

SnapOut is a browser game about interrupting everyday “上头” impulses. It presents timed cards, rewards `Snap Out` decisions, and uses a local-only phantom ledger. It is a game, not medical or financial advice, and has no real payments, accounts, telemetry, or external messaging.

## Core Files

- `src/SnapOutApp.jsx`: main UI and interaction flow.
- `src/gameLogic.js`: deterministic game rules.
- `src/ledgerStorage.js`: privacy-safe local persistence boundary.
- `docs/PRODUCT_MAP.md`: durable product map.
- `docs/architecture.md`: system and trust-boundary decisions.
