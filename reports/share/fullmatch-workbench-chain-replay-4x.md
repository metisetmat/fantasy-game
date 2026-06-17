# FullMatch Workbench Chain Replay 4X

Sprint 4X garde le rapport produit comme source unique, puis ajoute une comparaison multi-run locale pour distinguer un signal répété d'un signal ponctuel.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report remains available.

## Experimental Mode
- experimental mode remains opt-in.
- Product Report remains available.
- Export Snapshot remains available.
- Premium HTML Layout remains available.
- Phase Visuals remain available.
- Phase Visual Readability remains available.
- Player Candidate Comparison View remains available.
- Multi-Match Phase Comparison status: available.
- evidence category: WORKBENCH_CHAIN_COACH_REPORT_MULTI_MATCH_PHASE_COMPARISON.

## Multi-Match Comparison Summary
- html first: YES.
- pdf optional: YES.
- single source of truth: YES.
- duplicated report logic: NO.
- sample count: 4.
- panel count: 3.
- compared signal count: 8.
- repeated signal count: 6.
- visible-once signal count: 2.
- unstable signal count: 0.
- insufficient data count: 1.
- local comparison only: YES.
- product/export score matches: YES.
- candidate comparison matches product: YES.
- phase readability remains available: YES.

## Guardrails
- repeated signals remain local watchpoints, not global proof.
- no invented phase statistic is introduced.
- sandbox events are not promoted to official visuals.
- no recommendation or selection wording is introduced.
- no player is selected and no automatic selection is made.
- score, lineup, possession, scoring events, and global economy remain unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_MULTI_MATCH_PHASE_COMPARISON.
- CONFIRM_LOCAL_STABILITY_LABELS.
- CONFIRM_NO_GLOBAL_PROOF_CLAIM.
- PREPARE_UI_WIRING_OR_MULTI_MATCH_HISTORY_VIEW.

Trace validation status: PASS.
