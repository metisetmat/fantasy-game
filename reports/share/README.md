# Sprint 4F Share Pack

Mode: MINIMAL_REVIEW
Current sprint: Sprint 4F - Full Match Trace Validation

## What to read first

- validation.share-pack.md
- fullmatch-workbench-chain-replay-4f.md
- validation.fullmatch-workbench-chain-replay-4f.md
- fullmatch-trace-validation-4f.md
- coach-report.experimental.html

## Sprint boundary

Sprint 4F validates that Coach Report V0 changes when the full-match profile changes. It does not add coach cards, does not upgrade Selection Preview, does not change scoring constants, does not mutate official timeline, score, possession, or scoring events, and does not claim global scoring economy. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Review steps

1. Confirm validation.share-pack.md is PASS.
2. Read fullmatch-trace-validation-4f.md for all six profile outputs.
3. Read validation.fullmatch-workbench-chain-replay-4f.md for guardrails and counts.
4. Use bundle__simulation.md and bundle__reports.md for source excerpts and tests.
5. Use coach-report.experimental.html only to verify Coach Report V0 remains experimental and coach-readable.
