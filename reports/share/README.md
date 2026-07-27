# Sprint 8M Share Pack

Current sprint: Sprint 8M - Manual Post-Match Observation Review Form

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8L learning loop inside the product/export reports and replaces the standalone 8L docs with the 8M manual post-match review form docs.

Primary files:
- coach-report.product.html
- coach-report.export.html
- coach-report-manual-post-match-observation-review-form-8m.md
- validation.coach-report-manual-post-match-observation-review-form-8m.md
- validation.share-pack.md

Recommended review order:
1. coach-report.product.html
2. coach-report.export.html
3. validation.coach-report-manual-post-match-observation-review-form-8m.md
4. coach-report-manual-post-match-observation-review-form-8m.md
5. validation.share-pack.md

Key invariants:
- The 8M form is blank, pending, and filled only by a coach after a future real match.
- It creates no automatic classification, no submit/backend flow, no localStorage, no database/file persistence, and no team or season memory.
- It preserves the 8L tracker, 8K decision layer, 8I compact export metadata, source-of-truth boundaries, scoring constants, MatchBonusEvent, and batch/live separation.
- It does not claim future evidence, fabricate next-match evidence, or impose selection/composition/tactics.
- Sandbox, batch, and diagnostics remain separate from official truth.