# Roster-to-SpatialContext Adapter

Sprint 2S starts the bridge from official TeamSnapshot plus TacticalPlan plus WorkbenchTruth into a typed SpatialMatchContext that the mini-match path can carry.

## Answers
1. Can TeamSnapshot become SpatialTeamContext? YES.
2. Can sequence-1-action-1 become SpatialMatchContext? YES.
3. Can mini-match preserve actor/receiver/new carrier from workbench truth? YES at adapter/replay metadata level.
4. Does mini-match route ranking use real player attributes? PARTIAL/NO: attributes are carried into context, but ranking still resolves through the prototype route path.
5. Does full-match now replay the workbench? PARTIAL: diagnostics and replay seed exist, but full-match does not yet replay the workbench sequence chain.
6. Did scoring values change? NO.
7. Did scoring events change? NO.
8. Is 50-match economy still global reference? YES.

## Adapter Path
```text
TeamSnapshot + TacticalPlan + WorkbenchTruth
-> SpatialTeamContext
-> SpatialMatchContext
-> MiniMatchInput.spatialContext
-> Mini-match metadata/log visibility
```

## Sequence 1 Action 1 Replay Seed
- fixture: sequence-1-action-1.
- before ball carrier: control-tempo-half.
- before ball zone: Z4-HSL.
- selected action: TH -> ML.
- selected action type: SUPPORT_CLUSTER_RECYCLE.
- selected action subtype: BALL_SIDE_PRESSURE_ESCAPE.
- after new carrier: control-mobile-lock.
- after ball zone: Z3-HSL.
- replay seed status: PARTIAL, not fake PASS.

## What Improved
- SpatialTeamContext contract exists.
- TeamSnapshot -> SpatialTeamContext adapter exists.
- WorkbenchTruth -> SpatialMatchContext adapter exists.
- Role-to-tactical-functions mapping exists for CONTROL/BLITZ workbench roles.
- MiniMatchInput accepts optional spatialContext while preserving backward compatibility.
- Mini-match logs expose spatial_context_active metadata when supplied.
- Roster-to-mini-match gap analysis now distinguishes adapter-ready from route-ranking-not-yet-attribute-driven.
- Full-match grounding diagnostics now report partial grounding instead of total absence.

## Remaining Gaps
- Mini-match route ranking is not yet fully driven by real PlayerSnapshot attributes.
- CONTROL/BLITZ prototype behavior still strongly shapes normal resolution.
- Full-match does not yet replay the workbench action chain.
- TacticalPlan contributes summaries/context but does not yet fully generate spatial team shape.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER
- CONFIRM_WORKBENCH_REPLAY_SEED
- CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL
- CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_ATTRIBUTE_DRIVEN_ROUTE_RANKING
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
