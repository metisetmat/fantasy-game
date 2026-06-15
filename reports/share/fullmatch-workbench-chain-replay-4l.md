# FullMatch Workbench Chain Replay 4L

Sprint 4L makes Selection Preview readable as coach-facing observation cards. It separates sandbox origin, official trace support, decision status, and confirmation status without applying any selection or scoring change.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report hides Selection Preview coach-copy cards.

## Experimental Mode
- experimental mode remains opt-in.
- Selection Preview status: available.
- Selection Preview Trace Backing status: available.
- Selection Preview Coach Copy status: available.
- evidence category: WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY.
- card count: 3.

## Coach-Facing Labels
- Origine : hypothèse sandbox.
- Appui : appuyé par les traces officielles / non appuyé par les traces officielles pour l’instant.
- Décision : prévisualisation non appliquée.
- Confirmation : non confirmée comme recommandation officielle.

## Guardrails
- visible copy does not expose sandbox_only, trace_supported, or officially_confirmed as coach language.
- officially_confirmed visible count: 0.
- confidence upgrade count: 0.
- preview applied count: 0.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim forbidden.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
