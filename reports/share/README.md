# Sprint 6K Share Pack

Current sprint: Sprint 6K - Break Event And Post-Score Reset Calibration

Mode: MINIMAL_REVIEW

## What to read first

- validation.share-pack.md
- fullmatch-break-event-post-score-reset-calibration-6k.md
- validation.fullmatch-break-event-post-score-reset-calibration-6k.md
- coach-report.export.html
- coach-report.product.html

## Sprint boundary

Sprint 6K adds post-score reset and break-event evidence after Sprint 6J reduced dominance chains but left immediate reattack too high. It preserves 6H density, 6I opportunity balance, 6J chain gains, SHOT, TRY, CONVERSION-after-TRY, DROP, and CONTINUATION routes. It does not change scoring values, rewrite scores, delete scoring events, force opponent or trailing-team scores, mutate MatchBonusEvent, or use persistence/SQLite as a scoring source.

## Review steps

1. Confirm validation.share-pack.md is PASS.
2. Read the 6K calibration report for post-score reset and break-event metrics.
3. Inspect the 6K validation checklist for guardrails.
4. Use coach-report.export.html to verify the coach-facing reset section.
5. Use bundle__simulation.md and bundle__reports.md for source excerpts.
