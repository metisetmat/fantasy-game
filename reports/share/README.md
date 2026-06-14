# Sprint 4E Share Pack

Current sprint: Sprint 4E - Coach Report V0 from Trace Aggregates

## Files to review first

- fullmatch-workbench-chain-replay-4e.md
- validation.fullmatch-workbench-chain-replay-4e.md
- coach-report.experimental.html
- bundle__reports.md
- bundle__simulation.md

## Purpose

Sprint 4E renders the first Coach Report V0 from official trace aggregates. It answers basic coach questions about danger zones, pressure losses, recoveries, player involvement, recurring causes, and watchpoints.

Diagnostic and sandbox aggregates remain separated and never become official truth. Selection Preview remains sandbox_only and is not upgraded by this sprint.

## Review order

1. Read validation.share-pack.md.
2. Read fullmatch-workbench-chain-replay-4e.md.
3. Inspect validation.fullmatch-workbench-chain-replay-4e.md.
4. Open coach-report.experimental.html and confirm the Rapport coach depuis les agrégats officiels section.
5. Inspect bundle__reports.md for Coach Report V0 model, label mapping, renderer tests, and scope guards.

## Guardrails

- Scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- Visible cards use official aggregates only.
- Diagnostic aggregates stay separate.
- Sandbox aggregates stay separate.
- Selection Preview remains sandbox_only.
- Coach Report V0 cannot create scoring events.
- Coach Report V0 cannot drive live selection or production route resolution.
