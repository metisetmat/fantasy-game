# Sprint 4G Share Pack

Mode: MINIMAL_REVIEW
Current sprint: Sprint 4G - Profile Signal Calibration & Encoding Fix

## What to read first

- validation.share-pack.md
- fullmatch-workbench-chain-replay-4g.md
- validation.fullmatch-workbench-chain-replay-4g.md
- fullmatch-trace-validation-4g.md
- coach-report.experimental.html

## Sprint boundary

Sprint 4G fixes visible encoding issues and calibrates profile-specific signals from profile setup through simulated traces, official trace aggregates, and Coach Report V0. It does not add coach cards, does not upgrade Selection Preview, does not change scoring constants, does not mutate official timeline, score, possession, or scoring events, and does not claim global scoring economy. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Review steps

1. Confirm validation.share-pack.md is PASS.
2. Read fullmatch-trace-validation-4g.md for all six profile signatures.
3. Read validation.fullmatch-workbench-chain-replay-4g.md for signal, encoding, and guardrail counts.
4. Use bundle__simulation.md and bundle__reports.md for source excerpts and tests.
5. Use coach-report.experimental.html only to verify Coach Report V0 remains experimental and coach-readable.
