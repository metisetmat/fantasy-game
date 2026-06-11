# Selection-Driving Attribute Ranking

Sprint 2U moves route attributes beyond metadata-only evidence into a guarded candidate_modifier path.

## Mandatory Diagnosis
1. Are attributes beyond metadata? YES/PARTIAL: candidate_modifier can evaluate adjusted candidate selection, while normal full-match selection is still not fully authoritative.
2. Can attributes change candidate ranking? YES: attributeAdjustedScore can reorder candidates within the bounded adjustment cap.
3. Can attributes change the final selected candidate? YES in controlled candidate_modifier replay/contrast when the guard allows it; PARTIAL in normal mini-match/full-match integration.
4. Can attributes override closed lanes? NO: CLOSED lanes and NOT_AVAILABLE_NOW routes are blocked by the guard.
5. Does Sequence 1 Action 1 preserve TH -> ML? YES: candidate_modifier evaluates the replay seed but keeps the base SUPPORT_CLUSTER_RECYCLE action.
6. Does no spatialContext preserve previous behavior? YES: selection remains base-score driven.
7. Is full-match fully attribute-driven now? NO/PARTIAL: it exposes candidate_modifier diagnostics but still needs prototype selection replacement.
8. Did scoring values change? NO.
9. Did scoring events change? NO.
10. What must be built next? Full-match workbench chain replay and prototype selection replacement.

## Route Ranking Mode Contract
```text
off -> no attribute selection influence
metadata_only -> adjusted scores are computed, base selection remains authoritative
candidate_modifier -> adjusted scores may select a different legal candidate under guardrails
selection_driving -> reserved explicit mode using the same legality-preserving contract
```

## Candidate Modifier Evidence
- routeRankingMode contract exists.
- AttributeDrivenSelectionGuard exists.
- selectAttributeAdjustedCandidate exists.
- Contrast fixture proves a legal adjusted candidate flip.
- Contrast fixture blocks CLOSED lane override.
- Contrast fixture blocks NOT_AVAILABLE_NOW candidate override.
- Candidate adjustment remains bounded at -12..+12.

## Sequence 1 Action 1 Replay Seed
- fixture: sequence-1-action-1.
- before ball carrier: control-tempo-half.
- before ball zone: Z4-HSL.
- selected action: TH -> ML.
- selected action type: SUPPORT_CLUSTER_RECYCLE.
- selected action subtype: BALL_SIDE_PRESSURE_ESCAPE.
- after new carrier: control-mobile-lock.
- after ball zone: Z3-HSL.
- metadata_only result: rank-1 remains selected by base score.
- candidate_modifier result: rank-1 remains selected by base score after guard checks.
- selectionChangedByAttributes: false.
- selectedBy: base_score.
- routeRankingUsesRealAttributes: PARTIAL.
- replay seed status: PARTIAL, not fake PASS.

## Mini-Match Evidence
- MiniMatchInput accepts routeRankingAttributeMode.
- candidate_modifier can be passed into a spatialContext mini-match run.
- logs include attribute_selection_mode_candidate_modifier.
- setup exposes attributeSelectionResult, selectedBy, base selected candidate, adjusted selected candidate, and guard details.
- backward compatibility remains: no spatialContext keeps previous behavior.

## Full-Match Status
- route attribute candidate_modifier is available.
- attribute selection guard is active.
- attribute selection is not yet full-match authoritative.
- prototype selection is still partial.
- full-match still does not replay the workbench sequence chain.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0
- CONFIRM_ATTRIBUTE_SELECTION_GUARD
- CONFIRM_LEGAL_ATTRIBUTE_SELECTION_FLIP
- CONFIRM_CLOSED_LANE_NOT_OVERRIDDEN
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_PROTOTYPE_SELECTION_REPLACEMENT
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
