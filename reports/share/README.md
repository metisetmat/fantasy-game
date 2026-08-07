# Sprint 9D Share Pack

Current sprint: Sprint 9D - Export Metadata Badge Cleanup Before Coach-Facing Error Copy

Upload every file in this `reports/share` directory for review. This minimal pack replaces the standalone 9C docs with 9D export metadata badge cleanup docs while keeping 9C, 9B, 9A, and 8Z evidence embedded in bundles and generated reports.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md
4. coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md
5. validation.share-pack.md

## Sprint 9D Focus
- Corrects the visible cover badge from Export compact 9B to Export compact 9D.
- Aligns title, main id, current data attribute, cover badge, validation report, and share pack on 9D.
- Preserves historical 9C/9B/9A/8Z/8Y/8X/8W data attributes and sections.
- Adds strict cover badge audit: no body mention fallback can validate the badge.
- Adds false-positive guard for stale badge/title/main metadata.
- Keeps 9C detail cards intact: 16 cards, 3 groups, wording 97, complete coverage.
- Keeps runtime, payload, preview, persistence, official truth, selection, tactic, score, timeline, score_change, scoring constants, and MatchBonusEvent unchanged.

## Expected Validation
- validation.share-pack.md: Status PASS.
- share file count: 20.
- current sprint: Sprint 9D.
- previous standalone 9C docs copied: 0.
- cover badge text: Export compact 9D.
- metadata false positives after 9D: 0.
