# Sprint 4C Share Pack

Current sprint: Sprint 4C - Match Event Trace Spine

## Files to review first

- fullmatch-workbench-chain-replay-4c.md
- validation.fullmatch-workbench-chain-replay-4c.md
- coach-report.experimental.html
- bundle__simulation.md

## Purpose

Sprint 4C adds the foundational Match Event Trace Spine. It converts official MatchEvents, mini-match records, and sandbox replay events into shared MatchTraceEvent rows. The trace spine is diagnostic-only: it does not mutate official timeline, score, possession, scoring events, live selection, production route resolution, or global scoring economy proof.

Selection Preview remains available from Sprint 4B, but it is explicitly marked sandbox_only, requires the future match trace spine, and is marked as a future trace consumer.

## Review order

1. Read validation.share-pack.md.
2. Read fullmatch-workbench-chain-replay-4c.md.
3. Inspect validation.fullmatch-workbench-chain-replay-4c.md.
4. Open coach-report.experimental.html and confirm the compact Colonne de traces de match section.
5. Inspect bundle__simulation.md for MatchTraceEvent, the three adapters, trace spine evidence, and tests.

## Guardrails

- Scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- Sandbox traces are never official truth.
- Trace adapters cannot create production scoring events.
- Trace adapters cannot drive live selection or production route resolution.
