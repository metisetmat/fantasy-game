# Sprint 8R Share Pack

Current sprint: Sprint 8R - Manual Review Workflow Readiness Without Persistence

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8Q decision gate embedded in the product/export reports, then replaces the standalone 8Q docs with the 8R workflow-readiness docs.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-manual-review-workflow-readiness-without-persistence-8r.md
4. coach-report-manual-review-workflow-readiness-without-persistence-8r.md
5. validation.share-pack.md

## Sprint 8R Focus
- The 8R workflow map links 8M form -> 8N intake -> 8O preview -> 8P comparison -> 8Q gate.
- Workflow readiness is ready_for_non_persistent_preview while the 8Q review gate remains needs_completion.
- The report explicitly separates a demo-ready preview workflow from a review that still needs completion before real use.
- The workflow is demo-only, non-official, non-persistent, non-applied, and cannot drive selection or tactical instruction.
- Export metadata now mentions 8R, the compact export main id is cleaned to compressed-export-8r, and the 8P eyebrow is no longer mislabeled as Gate preview 8Q.

## Guardrails
- Scoring values unchanged.
- PENALTY_SHOT inactive.
- MatchBonusEvent unchanged.
- Score and timeline remain official score_change outputs.
- Manual workflow readiness creates no memory and no persistence.
- Share pack remains at or below 20 files.

## Recommendation
- KEEP_MANUAL_REVIEW_WORKFLOW_READINESS
- PREPARE_MANUAL_REVIEW_WORKFLOW_UX_SKELETON_WITHOUT_PERSISTENCE
