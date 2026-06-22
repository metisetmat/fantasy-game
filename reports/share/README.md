# Sprint 6H Share Pack

Current sprint: Sprint 6H - Segment Scoring Density Calibration

Included files:
- package.json
- tsconfig.json
- coach-report.latest.html
- coach-report.default.html
- coach-report.experimental.html
- coach-report.product.html
- coach-report.export.html
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- fullmatch-segment-scoring-density-calibration-6h.md
- validation.fullmatch-segment-scoring-density-calibration-6h.md
- validation.share-pack.md
- README.md
- manifest.md
- 00-share-manifest.txt
- bundle__contracts.md
- bundle__simulation.md
- bundle__reports.md

Start with validation.share-pack.md, then fullmatch-segment-scoring-density-calibration-6h.md and validation.fullmatch-segment-scoring-density-calibration-6h.md.

Sprint 6H reduces scoring-opportunity density per segment before score_change events are created. It preserves SHOT, TRY, CONVERSION-after-TRY, DROP, and CONTINUATION routes. It does not change scoring values, cap scores, rewrite scores, delete scoring events, force opponent scores, mutate MatchBonusEvent, or use persistence/SQLite as a scoring source.

Upload every file in this reports/share directory.
