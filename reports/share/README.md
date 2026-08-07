# Sprint 9C Share Pack

Current sprint: Sprint 9C - Manual Review Preview Payload Dry-Run Result Detail Cards Without Preview Activation

Upload every file in this `reports/share` directory for review. This minimal pack replaces the standalone 9B docs with the 9C dry-run detail-card docs while keeping 9B, 9A, and 8Z evidence embedded in bundles and generated reports.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md
4. coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md
5. validation.share-pack.md

## Sprint 9C Focus
- The 9C layer turns the 16 dry-run result rows from 9B into 16 coach-readable detail cards.
- Each card explains why the case exists, what a future validator would check, the expected error/blocker, the protected boundary, and the blocked next step.
- The compatible case remains explicitly non-accepted and non-preview-generating.
- Coverage stays complete: rules 20, errors 19, blockers 12, boundary guards 14, refusals 8.
- No runtime validation, payload read, payload acceptance, preview activation, persistence, official truth, selection, tactic, score, timeline, score_change, or event mutation is created.
- Export metadata now mentions 9C and the compact export main id is compressed-export-9c.

## Guardrails
- Scoring values unchanged.
- PENALTY_SHOT inactive.
- 9B remains preserved as the result-renderer baseline; standalone 9B docs are not copied into the share pack.
- 9A through 6X baselines remain preserved and embedded; source reports outside reports/share are not deleted.