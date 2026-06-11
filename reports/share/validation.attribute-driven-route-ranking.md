# Attribute-Driven Route Ranking Validation

Status: PASS

- PASS: route attribute influence contract exists.
- PASS: influence modifiers are bounded.
- PASS: candidates can receive attribute-adjusted scores.
- PASS: no spatialContext means unchanged scores.
- PASS: workbench replay seed applies attribute influence.
- PASS: replay seed preserves TH -> ML and Z3-HSL after-state.
- PASS: route ranking attribute gap updated from NO to PARTIAL.
- PASS: mini-match exposes attribute_influence_active metadata when spatialContext exists.
- PASS: full-match grounding diagnostic remains nuanced and warning-only.
- PASS: scoring constants unchanged.
- PASS: no scoring events deleted or capped.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: 50-match economy preserved.

## Counts
- workbench frames checked: 1
- route attribute influence contracts: 3
- route attribute influence tests: 2
- workbench replay seed status: PARTIAL
- routeRankingUsesRealAttributes: PARTIAL
- route attribute adjustment bound: -12..+12
- full-match grounding warning count: 7
- scoring constants changed: 0
- scoring events deleted or capped: 0
- share file count: 14

## Recommendation
- CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER
- CONFIRM_ATTRIBUTE_ADJUSTED_CANDIDATE_SCORES
- CONFIRM_SPATIAL_CONTEXT_BACKWARD_COMPATIBILITY
- CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP_REDUCED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_SELECTION_DRIVING_ATTRIBUTE_RANKING
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
