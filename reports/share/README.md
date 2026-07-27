# Sprint 8L Share Pack

Current sprint: Sprint 8L - Coach Report Seasonless Learning Loop & Observation Outcome Tracker

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8K decision layer and adds a pending, manual post-match observation tracker without season memory, database storage, prediction, scoring changes, or automatic selection.

Primary files:
- coach-report.product.html
- coach-report.export.html
- coach-report-seasonless-learning-loop-observation-outcome-tracker-8l.md
- validation.coach-report-seasonless-learning-loop-observation-outcome-tracker-8l.md
- validation.share-pack.md

Recommended review order:
1. coach-report.product.html
2. coach-report.export.html
3. validation.coach-report-seasonless-learning-loop-observation-outcome-tracker-8l.md
4. coach-report-seasonless-learning-loop-observation-outcome-tracker-8l.md
5. validation.share-pack.md

Key invariants:
- The 8L tracker is pending and must be filled only after the next match.
- It creates no season memory, team style memory, file/database persistence, or automatic decision.
- It preserves the 8K decision layer, 8I compact export thresholds, source-of-truth boundaries, scoring constants, MatchBonusEvent, and batch/live separation.
- Score, replay, and official story remain backed by score_change events.
- Sandbox, batch, and diagnostics remain separate from official truth.