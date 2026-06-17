# FullMatch Workbench Chain Replay 4Y

Sprint 4Y ajoute une première couche d’historique local sur la comparaison multi-run, sans créer une seconde source de vérité ni transformer ce recul en preuve globale.

## Default Mode
- default runFullMatch remains segment_harness.

## Experimental Mode
- experimental mode remains opt-in.
- Product Report remains available.
- Export Snapshot remains available.
- Premium HTML Layout remains available.
- Phase Visuals remain available.
- Phase Visual Readability remains available.
- Multi-Match Phase Comparison remains available.
- Player Candidate Comparison View remains available.
- Multi-Match History View status: available.
- evidence category: WORKBENCH_CHAIN_COACH_REPORT_MULTI_MATCH_HISTORY_VIEW.

## Multi-Match History Summary
- html first: YES.
- pdf optional: YES.
- single source of truth: YES.
- duplicated report logic: NO.
- sample count: 4.
- drilldown count: 8.
- history sample row count: 32.
- local repeated drilldown count: 6.
- local visible-once drilldown count: 2.
- local unstable drilldown count: 0.
- insufficient data drilldown count: 0.
- comparison sample count remains available: 4.

## Guardrails
- trend labels remain local watchpoints, not proof.
- no invented phase statistic is introduced.
- sandbox events are not promoted to official visuals.
- no recommendation or selection wording is introduced.
- no player is selected and no automatic selection is made.
- score, lineup, possession, scoring events, and global economy remain unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_MULTI_MATCH_HISTORY_VIEW.
- CONFIRM_TREND_DRILLDOWN_REMAINS_LOCAL.
- CONFIRM_NO_TREND_PROOF_CLAIM.
- PREPARE_UI_WIRING_OR_REAL_MATCH_HISTORY_STORE.

Trace validation status: PASS.
