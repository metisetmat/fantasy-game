# Sprint 8O Share Pack

Current sprint: Sprint 8O - Manual Review Preview Renderer Without Persistence

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8M blank manual form and the 8N intake boundary inside the product/export reports, then replaces the standalone 8N docs with the 8O non-persistent preview renderer docs.

Primary files:
- coach-report.product.html
- coach-report.export.html
- coach-report-manual-review-preview-renderer-without-persistence-8o.md
- validation.coach-report-manual-review-preview-renderer-without-persistence-8o.md
- validation.share-pack.md

Recommended review order:
1. coach-report.product.html
2. coach-report.export.html
3. validation.coach-report-manual-review-preview-renderer-without-persistence-8o.md
4. coach-report-manual-review-preview-renderer-without-persistence-8o.md
5. validation.share-pack.md

Key invariants:
- The 8O preview renders only a valid 8N payload fixture after validation.
- Invalid payloads are blocked before rendering.
- The preview is demo-only, non-official, non-persistent, and non-applied.
- It creates no localStorage, database, file persistence, backend submit, memory, official truth, score/timeline mutation, ScoringEvent, selection automation, or tactical instruction.
- It preserves the 8N intake boundary, 8M form, 8L tracker, 8K decision layer, compact export, source-of-truth boundaries, scoring constants, MatchBonusEvent, and batch/live separation.
- The visible export metadata is current for 8O and the compact export stays under the honest read-time threshold.