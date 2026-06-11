# Selection-Driving Attribute Ranking Validation

Status: PASS

- PASS: RouteRankingAttributeMode includes off, metadata_only, candidate_modifier, selection_driving.
- PASS: route attribute influence contract exists.
- PASS: influence modifiers are bounded.
- PASS: candidates can receive attribute-adjusted scores.
- PASS: no spatialContext means unchanged scores.
- PASS: metadata_only computes adjusted scores but preserves base selection.
- PASS: candidate_modifier can flip to a legal adjusted candidate.
- PASS: CLOSED lane cannot be selected by attributes.
- PASS: NOT_AVAILABLE_NOW candidate cannot be selected by attributes.
- PASS: workbench replay seed evaluates metadata_only and candidate_modifier.
- PASS: replay seed preserves TH -> ML and Z3-HSL after-state.
- PASS: mini-match exposes attribute_selection_mode_candidate_modifier when requested.
- PASS: full-match grounding diagnostic remains nuanced and warning-only.
- PASS: full-match is not claimed as fully attribute-driven.
- PASS: scoring constants unchanged.
- PASS: no scoring events deleted or capped.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: 50-match economy preserved.

## Counts
- workbench frames checked: 1
- route attribute influence contracts: 3
- route attribute selection tests: 4
- workbench replay seed status: PARTIAL
- routeRankingUsesRealAttributes: PARTIAL
- route attribute adjustment bound: -12..+12
- legal attribute selection flips checked: 1
- closed lane override attempts blocked: 1
- unavailable candidate override attempts blocked: 1
- full-match grounding warning count: 9
- scoring constants changed: 0
- scoring events deleted or capped: 0
- share file count: 14

## Recommendation
- CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0
- CONFIRM_ATTRIBUTE_SELECTION_GUARD
- CONFIRM_LEGAL_ATTRIBUTE_SELECTION_FLIP
- CONFIRM_CLOSED_LANE_NOT_OVERRIDDEN
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_PROTOTYPE_SELECTION_REPLACEMENT
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
