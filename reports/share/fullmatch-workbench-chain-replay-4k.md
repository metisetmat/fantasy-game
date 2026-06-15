# FullMatch Workbench Chain Replay 4K

Sprint 4K connects Selection Preview cards to official match trace aggregates as support evidence only. A card can become trace_supported when official aggregate signals exist, but it remains a coach hypothesis and never becomes officially_confirmed.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report hides Selection Preview and trace-backing cards.

## Experimental Mode
- experimental mode remains opt-in.
- Selection Preview status: available.
- Selection Preview Trace Backing status: available.
- evidence category: WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING.
- status values available: sandbox_only, trace_supported, officially_confirmed.
- officially_confirmed count: 0.

## Trace Support Scope
- official match trace aggregates can support preview cards.
- diagnostic aggregates remain separate.
- sandbox aggregates remain separate.
- official aggregates are support only.
- confidence is not upgraded automatically.
- preview cards remain non-applied.

## Coach Report Copy
- Selection Preview cards show Statut d'appui.
- Selection Preview cards show Source principale.
- Selection Preview cards show non rehaussee automatically as a confidence guard.
- visible copy says Previsualisation non appliquee before normalization.
- normalized report copy presents coach-facing French accents.
- cards do not say Composition recommandee, Meilleure selection, Changement applique, Officiellement confirme, or Confiance elevee.

## Guardrails
- can change lineup: false.
- can change starters: false.
- can change bench: false.
- can drive coach instruction: false.
- can drive live selection: false.
- can drive production route resolution: false.
- can mutate official timeline: false.
- can mutate official score: false.
- can mutate official possession: false.
- can create production scoring events: false.
- can claim global economy: false.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
