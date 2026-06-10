# Roster-to-SpatialContext Adapter Validation

Status: PASS

- PASS: spatial context types exist.
- PASS: role-to-function mapping exists.
- PASS: TeamSnapshot -> SpatialTeamContext adapter exists.
- PASS: WorkbenchTruth -> SpatialMatchContext adapter exists.
- PASS: workbench replay seed runner exists.
- PASS: sequence-1-action-1 replay seed does not fail.
- PASS: mini-match remains backward compatible without spatial context.
- PASS: mini-match can carry spatial context metadata.
- PASS: replay seed preserves actor TH, receiver ML, new carrier ML, and ball zone Z3-HSL.
- PASS: route ranking attribute gap is reported.
- PASS: full-match grounding diagnostic is nuanced and warning-only.
- PASS: scoring constants unchanged.
- PASS: no scoring events deleted or capped.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: 50-match economy preserved.

## Counts
- workbench frames checked: 1
- spatial context adapter count: 2
- workbench replay seed status: PARTIAL
- role mappings checked: 10
- full-match grounding warning count: 6
- scoring constants changed: 0
- scoring events deleted or capped: 0
- share file count: 14

## Recommendation
- CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER
- CONFIRM_WORKBENCH_REPLAY_SEED
- CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL
- CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_ATTRIBUTE_DRIVEN_ROUTE_RANKING
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
