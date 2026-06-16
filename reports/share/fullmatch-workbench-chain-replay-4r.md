# FullMatch Workbench Chain Replay 4R

Sprint 4R stress-tests Joueurs a etudier on a richer roster so credible partial fits, exclusions, penalties, and honest empty states remain readable without driving selection.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report remains available.

## Experimental Mode
- experimental mode remains opt-in.
- Player Matchup View remains available.
- Player Matchup Calibration remains available.
- Roster Coverage Matchup status: available.
- evidence category: WORKBENCH_CHAIN_ROSTER_COVERAGE_MATCHUP.
- product report file generated: coach-report.product.html.

## Coverage Summary
- roster size: 10.
- profile count: 3.
- evaluated pair count: 30.
- visible candidate count: 16.
- credible candidate count: 16.
- high fit count: 10.
- medium fit count: 10.
- low fit count: 0.
- not compatible count: 10.
- excluded candidate count: 14.
- penalized candidate count: 1.
- empty profile block count: 0.
- goalkeeper outfield exclusion count: 2.
- universal match guard triggered count: 4.
- repeated same player across profiles count: 7.
- max visible profiles per player: 2.
- player strong fit all profiles count: 0.
- goalkeeper strong fit all profiles count: 0.

## Guardrails
- player selected count: 0.
- automatic selection count: 0.
- lineup mutation count: 0.
- starters mutation count: 0.
- bench mutation count: 0.
- confidence upgrade count: 0.
- officially-confirmed count: 0.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_ROSTER_COVERAGE_MATCHUP.
- CONFIRM_MATCHUP_CALIBRATION_HOLDS_ON_RICHER_ROSTER.
- CONFIRM_NO_AUTOMATIC_SELECTION.
- PREPARE_PDF_EXPORT_OR_PLAYER_CARD_POLISH.

Trace validation status: PASS.
