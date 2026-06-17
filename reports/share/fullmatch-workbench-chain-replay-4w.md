# FullMatch Workbench Chain Replay 4W

Sprint 4W keeps the phase visuals from 4V and makes them coach-readable in ten seconds: visible legend, primary and secondary hierarchy, short interpretation copy, and honest controlled empty states.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report remains available.

## Experimental Mode
- experimental mode remains opt-in.
- Product Report remains available.
- Export Snapshot remains available.
- Premium HTML Layout remains available.
- Phase Visuals remain available.
- Player Candidate Comparison View remains available.
- Phase Visual Readability status: available.
- evidence category: WORKBENCH_CHAIN_COACH_REPORT_PHASE_VISUAL_READABILITY.

## Readability Summary
- html first: YES.
- pdf optional: YES.
- single source of truth: YES.
- duplicated report logic: NO.
- legend visible: YES.
- legend item count: 5.
- panel count: 3.
- readable panel count: 3.
- panels with primary zone count: 2.
- panels with secondary zones count: 2.
- controlled empty state count: 1.
- phase-specific guard visible: YES.
- product/export score matches: YES.
- candidate comparison matches product: YES.
- phase visuals remain available: YES.

## Guardrails
- readability remains presentation-only.
- no invented phase statistic is introduced.
- sandbox events are not promoted to official visuals.
- no recommendation or selection wording is introduced.
- no player is selected and no automatic selection is made.
- score, lineup, possession, scoring events, and global economy remain unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_PHASE_VISUAL_READABILITY.
- CONFIRM_LEGEND_AND_ZONE_HIERARCHY.
- CONFIRM_NO_INVENTED_PHASE_STATS.
- PREPARE_UI_WIRING_OR_MULTI_MATCH_PHASE_COMPARISON.

Trace validation status: PASS.
