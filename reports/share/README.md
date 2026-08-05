# Sprint 8Z Share Pack

Current sprint: Sprint 8Z - Manual Review Validation Contract Audit Consistency Repair

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8Y validation contract embedded in product/export reports, then replaces the standalone 8Y docs with the 8Z audit-consistency repair docs.

## What To Review First
1. coach-report.export.html
2. coach-report.product.html
3. validation.coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md
4. coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md
5. validation.share-pack.md

## Sprint 8Z Focus
- The 8Z layer repairs audit-only inconsistencies discovered in the 8Y validation-contract report.
- Wording threshold/status logic is now honest: 88 is the documented before state, >=90 passes, and >=95 is strong.
- Integration selectors now detect product/export action plan and tactical map cards from the real report sections.
- Status/warning consistency prevents PASS when a threshold, selector, or critical audit invariant fails.
- The 8Y validation contract remains embedded as the baseline; standalone 8Y docs are not copied into the share pack.
- Export metadata now mentions 8Z and the compact export main id is cleaned to compressed-export-8z.

## Guardrails
- Scoring values unchanged.
- PENALTY_SHOT inactive.
- No real input, payload instance, field-to-payload runtime, payload validation runtime, preview generation, submit, API, backend, storage, draft, history, memory, official truth, automatic decision, selection, tactical instruction, score mutation, timeline mutation, or score_change creation.
- 8Y, 8X, 8W, 8V, 8U, 8R, 8Q, 8O, and 6X baselines remain preserved and embedded; source reports outside reports/share are not deleted.