# FullMatch Workbench Chain Replay 4H

Sprint 4H adds an experimental Coach Report V1 visualization layer above Coach Report V0. It renders official trace aggregates as coach-readable visual cards while keeping diagnostics and sandbox evidence separated.

## Coach Report V1 Visualization
- title: Rapport coach V1 — lecture visuelle des agrégats officiels
- source of truth: official match trace aggregates via Coach Report V0
- visible source badge: Source : Officiel
- visible confidence badge: Confiance : faible / moyenne / élevée
- diagnostic cards: 0
- sandbox cards: 0
- technical tags: collapsed in Détails techniques du rapport V1

## Visual Blocks
- executive coach summary with final score, up to three official signals, one watchpoint, confidence, and source.
- official signal cards for danger, pressure/losses, recoveries, player involvement, causes/impacts, and watchpoint.
- zone signal blocks for danger, pressure loss, and recovery.
- player involvement block wording: Ce bloc mesure l’implication dans les traces officielles, pas une note individuelle complète.
- causes and impacts use French labels only in visible copy.
- every visible card exposes source and confidence badges plus a confidence reason.

## Empty State
- pressure-loss empty state: Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées.
- the empty state prevents fake zone mapping when pressure exists but pressure-loss zones are not stable.

## Guardrails
- default coach report hides Coach Report V1.
- experimental coach report shows Coach Report V1.
- diagnostics remain explanatory support only.
- sandbox remains test-only.
- Selection Preview remains sandbox_only and confidence is not upgraded.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim: forbidden.
- scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES
- profiles with expected primary signal: 6
- profiles with accepted fallback signal: 6

## Recommendations
- CONFIRM_COACH_REPORT_V1_VISUALIZATION_AVAILABLE.
- CONFIRM_OFFICIAL_AGGREGATES_REMAIN_SOURCE_OF_TRUTH.
- CONFIRM_DEFAULT_REPORT_HIDES_V1.
- PREPARE_COACH_REPORT_V1_VISUAL_POLISH.
