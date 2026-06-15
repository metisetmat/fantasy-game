# FullMatch Workbench Chain Replay 4J

Sprint 4J cleans the Coach Report V1 reading flow. It keeps V1 as the main coach report, moves legacy key moments and coach analysis under collapsed technical traceability in experimental mode, and labels score sources explicitly.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report hides Coach Report V1 hierarchy and legacy cleanup hierarchy.

## Experimental Mode
- experimental mode remains opt-in.
- Coach Report V1 Visualization status: available.
- Coach Report V1 Information Hierarchy status: available.
- Coach Report V1 Legacy Cleanup status: available.

## Legacy Cleanup
- legacy moments disposition: collapsed_under_technical_traceability.
- legacy coach analysis disposition: collapsed_under_technical_traceability.
- legacy sections compete with V1: false.
- legacy collapsed or absorbed: true.

## Score Source Clarity
- score source label available: true.
- full-match score label visible: Score du rapport full-match.
- scoring-events sample label visible: Echantillon live scoring-events.
- batch diagnostics label visible: Diagnostic batch separe.
- score sources confused: false.

## Copy And Guardrails
- visible French copy clean: true.
- unaccented French visible issue count: 0.
- mojibake marker count: 0.
- Selection Preview remains sandbox_only.
- Selection Preview confidence not upgraded.
- diagnostic and sandbox aggregates kept separate.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
