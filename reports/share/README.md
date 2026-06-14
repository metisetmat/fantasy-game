# Sprint 4D Share Pack

Current sprint: Sprint 4D - Match Trace Aggregator

## Files to review first

- fullmatch-workbench-chain-replay-4d.md
- validation.fullmatch-workbench-chain-replay-4d.md
- coach-report.experimental.html
- bundle__simulation.md

## Purpose

Sprint 4D adds the Match Trace Aggregator. It groups MatchTraceEvent rows into official, diagnostic, and sandbox scopes, applies source-priority deduplication, and exposes aggregate facts for future coach reports.

Selection Preview remains available from Sprint 4B, but it stays sandbox_only. The aggregator does not upgrade preview confidence and cannot drive live selection.

## Review order

1. Read validation.share-pack.md.
2. Read fullmatch-workbench-chain-replay-4d.md.
3. Inspect validation.fullmatch-workbench-chain-replay-4d.md.
4. Open coach-report.experimental.html and confirm the compact Agregats de traces de match section.
5. Inspect bundle__simulation.md for aggregate types, deduplication, aggregate builder, evidence, guards, and tests.

## Guardrails

- Scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- Official aggregates exclude sandbox traces.
- Diagnostic aggregates do not become official truth.
- Sandbox aggregates remain hypothetical.
- Aggregates cannot create production scoring events.
- Aggregates cannot drive live selection or production route resolution.
