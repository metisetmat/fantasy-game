# Attribute-Driven Route Ranking

Sprint 2T introduces a bounded, explainable attribute-influence layer for route candidates carried through SpatialMatchContext.

## Answers
1. Are real player attributes now carried into route ranking? YES/PARTIAL: SpatialPlayerContext attributes feed candidate influence metadata.
2. Which attributes influence recycle/support? handPlay, intelligence, mental, currentCondition, mentalFreshness, and pressure-escape tactical functions.
3. Which attributes influence rupture/forward progress? speed, footPlayDribble, intelligence, power, handPlay, endurance, and mental stability.
4. Which attributes influence turnover risk and final action composure? currentCondition, mentalFreshness, pressureLevel, laneState, footPlayPassingShooting, mental, and intelligence.
5. Does route ranking now fully use real player attributes? PARTIAL: candidates can receive bounded adjusted scores, but normal mini-match final selection remains prototype-dominant.
6. Does full-match now fully replay workbench truth? PARTIAL.
7. Did scoring values change? NO.
8. Did scoring events change? NO.
9. What must be built next? Selection-driving attribute ranking and full-match workbench chain replay.

## Influence Path
```text
SpatialPlayerContext attributes
-> RouteAttributeInfluence[]
-> bounded total adjustment (-12..+12)
-> attributeAdjustedScore
-> metadata-only mini-match exposure for now
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
- route attribute influence applied: YES.
- selected candidate base score and adjusted score exposed: YES.
- routeRankingUsesRealAttributes: PARTIAL.
- replay seed status: PARTIAL, not fake PASS.

## What Improved
- RouteAttributeInfluence contract exists.
- Bounded route attribute helper exists.
- Candidates can receive attributeAdjustedScore while preserving baseScore.
- No spatialContext leaves candidate scores unchanged.
- Workbench replay seed applies attribute influence to ranked options.
- Mini-match logs expose attribute_influence_active in metadata_only mode when spatialContext exists.
- Roster-to-mini-match gap analysis now reports visibleAttributesDriveRouteRanking: PARTIAL.
- Full-match grounding diagnostics now report route attribute influence available but prototype selection still dominant.

## Remaining Gaps
- Attribute-adjusted scores are not yet the authoritative final selection path.
- CONTROL/BLITZ prototype behavior still strongly shapes normal resolution.
- Full-match does not yet replay the workbench action chain.
- TacticalPlan contributes summaries/context but does not yet fully generate spatial team shape or route identity.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER
- CONFIRM_ATTRIBUTE_ADJUSTED_CANDIDATE_SCORES
- CONFIRM_SPATIAL_CONTEXT_BACKWARD_COMPATIBILITY
- CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP_REDUCED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_SELECTION_DRIVING_ATTRIBUTE_RANKING
- PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY
