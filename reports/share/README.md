# Sprint 3Z Share Pack

Mode: MINIMAL_REVIEW
Current sprint: Sprint 3Z - Coach Report UX Cleanup & Encoding Fix

## What to read first

- fullmatch-workbench-chain-replay-3z.md
- validation.fullmatch-workbench-chain-replay-3z.md
- validation.share-pack.md
- coach-report.experimental.html
- coach-report.default.html

## Sprint boundary

Sprint 3Z fixes coach report readability only. It repairs visible UTF-8 copy, keeps technical diagnostics behind developer details, and preserves the default/experimental boundary. It does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, live selection, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Review steps

1. Read validation.share-pack.md first.
2. Read fullmatch-workbench-chain-replay-3z.md.
3. Inspect validation.fullmatch-workbench-chain-replay-3z.md.
4. Open coach-report.experimental.html and verify Confiance multi-scénarios, Stabilité, and the em dash render correctly.
5. Open coach-report.default.html and verify experimental sandbox sections are absent.
6. Use bundle__reports.md for renderer and guard implementation details.
