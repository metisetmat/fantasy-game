# Sprint 8I Share Pack

Current sprint: Sprint 8I - Story-First Export Budget & Validation Threshold Fix

Upload every file in this `reports/share` directory for review. This minimal pack keeps the product report complete while the export report is compressed and validated against strict numeric read-time thresholds.

Primary files:
- coach-report.product.html
- coach-report.export.html
- story-first-export-budget-validation-threshold-fix-8i.md
- validation.story-first-export-budget-validation-threshold-fix-8i.md
- validation.share-pack.md

Recommended review order:
1. coach-report.export.html
2. validation.story-first-export-budget-validation-threshold-fix-8i.md
3. story-first-export-budget-validation-threshold-fix-8i.md
4. coach-report.product.html
5. validation.share-pack.md

Key invariants:
- exportUnder900Seconds and exportUnder800Seconds are computed from actual numeric read-time thresholds.
- A failed threshold cannot be described as PASS.
- The product report remains the full story-first report.
- The export report keeps the story, replay, action plan, tactical map essentials, and source-of-truth note without full timeline, sandbox panel, or batch diagnostics.