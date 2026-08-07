# Sprint 9B Share Pack

Current sprint: Sprint 9B - Manual Review Preview Payload Dry-Run Result Renderer Without Preview Activation

Upload every file in this `reports/share` directory for review. This minimal pack replaces the standalone 9A docs with the 9B dry-run result renderer docs while keeping 9A and 8Z evidence embedded in bundles and generated reports.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md
4. coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md
5. validation.share-pack.md

## Sprint 9B Focus
- The 9B layer renders 9A dry-run results as readable coach-facing groups and rows.
- Sixteen cases and sixteen results remain visible, with the compatible case explicitly marked non-accepted.
- Coverage stays complete: rules 20, errors 19, blockers 12, boundary guards 14, refusals 8.
- No runtime validation, payload read, payload acceptance, preview activation, persistence, official truth, selection, tactic, score, timeline, score_change, or event mutation is created.
- Export metadata now mentions 9B and the compact export main id is compressed-export-9b.

## Guardrails
- Scoring values unchanged.
- PENALTY_SHOT inactive.
- 9A remains preserved as the dry-run validator baseline; standalone 9A docs are not copied into the share pack.
- 8Z through 6X baselines remain preserved and embedded; source reports outside reports/share are not deleted.