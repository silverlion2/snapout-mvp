# SnapOut Memory System

Last updated: 2026-05-29

## Purpose

The memory system keeps product context, current status, and work-session history available across agent sessions without forcing every future agent to rediscover the repo from scratch.

## Memory Layers

```text
README.md
  Public project overview and developer commands.

docs/PRODUCT_MAP.md
  Tracked product map: audience, flow, data model, risks, and next steps.

docs/MEMORY_SYSTEM.md
  Tracked explanation of how memory should be maintained.

.gemini/GEMINI.md
  Local project identity and stack context.

.gemini/MEMORY.md
  Local current-state summary, milestones, blockers, and repo stats.

.gemini/sessions/YYYY-MM-DD.md
  Local timestamped session log for work performed on a given day.
```

## Update Rules

- Keep `.gemini/MEMORY.md` short; move detailed history into dated session logs.
- Update `docs/PRODUCT_MAP.md` when the implemented product journey, data model, or major risks change.
- Update `README.md` when setup commands, product scope, or project structure changes.
- Add a timestamped bullet to `.gemini/sessions/YYYY-MM-DD.md` when starting a task, completing a milestone, running verification, or hitting a blocker.
- Treat `.gemini/` as local operational memory. It may be ignored by Git, so durable product knowledge belongs in `docs/`.

## Session Log Template

```markdown
# Session YYYY-MM-DD

- HHhMM: Session started. Goal: ...
- HHhMM: Updated ...
- HHhMM: Verified ...
- HHhMM: Blocked by ...
```

## Current Operating Notes

- This repo already has a `.gemini/` scaffold.
- The local project tracker script currently reports that this directory is not registered as a tracked project.
- Until the tracker is registered, keep `.gemini/MEMORY.md` accurate manually.
