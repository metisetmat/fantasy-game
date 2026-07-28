# Sprint 8N Share Pack

Current sprint: Sprint 8N - Manual Review Result Intake Boundary

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8M blank manual form inside the product/export reports and replaces the standalone 8M docs with the 8N manual result intake boundary docs.

Primary files:
- coach-report.product.html
- coach-report.export.html
- coach-report-manual-review-result-intake-boundary-8n.md
- validation.coach-report-manual-review-result-intake-boundary-8n.md
- validation.share-pack.md

Recommended review order:
1. coach-report.product.html
2. coach-report.export.html
3. validation.coach-report-manual-review-result-intake-boundary-8n.md
4. coach-report-manual-review-result-intake-boundary-8n.md
5. validation.share-pack.md

Key invariants:
- The 8N boundary accepts only typed manual coach review results for preview or validation.
- It creates no persistence, no official truth promotion, no score or timeline mutation, no ScoringEvent, no memory, and no selection or tactical automation.
- It rejects unknown outcomes, malformed linked IDs, missing acknowledgements, wrong entry counts, and mutation/persistence flags.
- It preserves the 8M form, 8L tracker, 8K decision layer, 8I story-first export markers as historical data attributes, source-of-truth boundaries, scoring constants, MatchBonusEvent, and batch/live separation.
- The visible export metadata is current for 8N and no longer exposes stale `compressed-export-8i` or `Export story-first 8I` labels.