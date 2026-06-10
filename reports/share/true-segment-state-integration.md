# True Segment-State Integration

Sprint 2Q connects `FullMatchSegmentState` to later mini-match resolution inputs through a bounded influence model.

## What Changed
- `src/simulation/fullMatch/fullMatchSegmentInfluence.ts` converts previous segment state into small deterministic modifiers.
- `MiniMatchInput.segmentInfluence` is optional, so `runMiniMatch()` remains backward compatible when no influence is supplied.
- `runFullMatch()` passes segment influence after the first segment only.
- Mini-match context creation uses the influence to adjust freshness, momentum, collective stability, pressure, chaos, territorial pressure, danger, and sequence momentum.
- Match events receive internal tags such as `segment_influence_active`, `segment_influence_fatigue`, `segment_influence_momentum`, `segment_influence_defensive_stress`, and `segment_influence_pattern_pressure`.

## Safety Bounds
- Influence modifiers are capped between -5 and +5.
- Segment influence never creates points directly.
- Segment influence never deletes or caps scoring events.
- Segment influence does not force routes, scores, or winners.
- Final score remains derived from active `score_change` consequences.

## Coach Evidence Boundary
- Segment influence appears as canonical evidence and internal tags.
- Visible coach copy stays readable and does not expose raw technical tags as key-moment prose.
- Segment-state evidence describes accumulated match pressure, stability, and freshness without claiming global scoring-economy validity.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_TRUE_SEGMENT_STATE_INTEGRATION_V0
- CONFIRM_MINIMATCH_BACKWARD_COMPATIBILITY
- CONFIRM_SEGMENT_INFLUENCE_SAFE_BOUNDS
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_DEEPER_TACTICAL_PLAN_INFLUENCE
- PREPARE_REAL_PLAYER_STATS
