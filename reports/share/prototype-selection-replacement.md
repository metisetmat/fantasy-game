# Prototype Selection Replacement in MiniMatch

Sprint 2V starts replacing prototype-dominant mini-match route selection with a controlled SpatialContext candidate path.

## Mandatory Diagnosis
1. Is prototype selection still present? YES: prototype fallback remains enabled.
2. Is a spatial candidate modifier path available? YES.
3. Does controlled mini-match use spatial candidate selection? YES/PARTIAL: explicit mini-match tests and the replay seed use spatial_candidate_modifier, while sequence execution remains conservative.
4. Does normal full-match use spatial selection by default? NO/PARTIAL: normal full-match reports the path but does not default to it.
5. Can attributes select a different legal route? YES in controlled contrast tests.
6. Can attributes override closed/unavailable candidates? NO.
7. Does sequence-1-action-1 preserve TH -> ML? YES.
8. Does no spatialContext preserve previous behavior? YES.
9. Did scoring values change? NO.
10. Did scoring events change? NO.
11. What remains next? Full-match workbench chain replay and a normal full-match spatial-selection feature flag.

## Mini-Match Route Selection Source
```text
prototype -> current default behavior
spatial_candidate_modifier -> SpatialContext candidates + attribute-adjusted ranking + guard + prototype fallback
spatial_selection_driving -> reserved future explicit mode
```

## What Was Added
- MiniMatchRouteSelectionSource contract.
- MiniMatchInput.routeSelectionSource.
- SpatialContext route candidate generation.
- Prototype-to-spatial candidate mapper.
- MiniMatchRouteSelectionResult.
- Controlled mini-match route selection logs and record metadata.
- Controlled replay seed using routeSelectionSource=spatial_candidate_modifier.

## Sequence 1 Action 1 Replay Seed
- fixture: sequence-1-action-1.
- before ball carrier: control-tempo-half.
- before ball zone: Z4-HSL.
- selected action: TH -> ML.
- selected action type: SUPPORT_CLUSTER_RECYCLE.
- selected action subtype: BALL_SIDE_PRESSURE_ESCAPE.
- after new carrier: control-mobile-lock.
- after ball zone: Z3-HSL.
- routeSelectionSource: spatial_candidate_modifier.
- route selection result: exposed.
- guard status: PASS.
- TH -> ML preserved: YES.
- prototype fallback still enabled: YES.
- replay seed status: PARTIAL, not fake PASS.

## Controlled Contrast Evidence
- legal adjusted spatial candidate can win.
- CLOSED candidate cannot win.
- NOT_AVAILABLE_NOW candidate cannot win.
- if spatial guard blocks all candidates, prototype fallback is used.

## Full-Match Status
- SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE is reported.
- CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE is reported.
- PROTOTYPE_FALLBACK_STILL_ENABLED is reported.
- NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN is reported.
- FULLMATCH_NOT_YET_REPLAYING_WORKBENCH_SEQUENCE_CHAIN remains true.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_SPATIAL_ROUTE_SELECTION_PATH
- CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED
- CONFIRM_CONTROLLED_MINIMATCH_SPATIAL_SELECTION
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_BLOCKED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
- PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG
