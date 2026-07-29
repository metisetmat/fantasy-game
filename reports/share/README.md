# Sprint 8Q Share Pack

Current sprint: Sprint 8Q - Manual Review Preview Decision Gate Without Persistence

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8P comparison embedded in the product/export reports, then replaces the standalone 8P docs with the 8Q decision gate docs.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-manual-review-preview-decision-gate-without-persistence-8q.md
4. coach-report-manual-review-preview-decision-gate-without-persistence-8q.md
5. validation.share-pack.md

## Sprint 8Q Focus
- The 8Q gate reads only the validated 8P preview-vs-plan comparison.
- Three gate cards are visible: one lisible, one a completer, and one insuffisant.
- The global gate is a completer because the fixture has one complete answer, one partial answer, and one insufficient answer.
- Each card keeps links to 8P comparison, 8O preview, 8N intake, 8M manual review form, 8L observation outcome tracker, and 8K decision layer.
- The gate is demo-only, non-official, non-persistent, non-applied, and cannot drive selection or tactical instruction.
- Export metadata now mentions 8Q and no longer leaves the compact export main id as compressed-export-8p.

## Guardrails
- Scoring values unchanged.
- PENALTY_SHOT inactive.
- MatchBonusEvent unchanged.
- Score and timeline remain official score_change outputs.
- Manual preview decision gate creates no memory and no persistence.
- Share pack remains at or below 20 files.

## Recommendation
- KEEP_MANUAL_REVIEW_PREVIEW_DECISION_GATE
- PREPARE_MANUAL_REVIEW_WORKFLOW_AFTER_DECISION_GATE
