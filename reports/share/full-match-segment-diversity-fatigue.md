# Full-Match Segment Diversity + Fatigue Propagation

Sprint 2N improves the local full-match harness without changing scoring values or using one runFullMatch output as global economy evidence.

## Segment State
- Added FullMatchSegmentState with cumulative score context, condition, mental freshness, momentum, pressure load, scoring confidence, and defensive stress for both teams.
- Events now receive score-state tags such as score_state_level, score_state_close, score_state_home_leading, score_state_away_leading, and score_state_lopsided.
- State is deterministic and does not delete, cap, or rewrite scoring events after generation.

## Fatigue Propagation
- Added deterministic full-match fatigue propagation.
- High pressing, risk, pressure events, second-half status, and conceded scoring events increase load.
- Scoring can improve momentum, but it does not restore physical condition.
- Full-match team summaries now use propagated condition and high-intensity load; player summaries move with team-level propagation.

## Segment Diversity Diagnostics
- Segment diagnostics track scoring patterns, zone patterns, event-family patterns, fatigue delta, and momentum delta.
- Repetition warnings remain warnings, not scoring failures.
- Available warnings: REPEATED_SCORING_PATTERN, REPEATED_ZONE_PATTERN, LOW_EVENT_FAMILY_DIVERSITY, NO_FATIGUE_DELTA, ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN.

## Key Moment Diversity
- Key moment selection remains capped at five.
- When non-scoring candidates exist, scoring key moments are selected at most twice.
- Pressure, territorial pressure, danger, fatigue/momentum, and harness-context moments can now appear beside scoring moments.

## Source-Of-Truth Preservation
- Scoring values were not changed: SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Scoring events are not deleted, capped, hidden, or rewritten.
- Final score remains derived from score_change consequences.
- Batch/live separation remains preserved.
- The validated 50-match full-match economy remains the global scoring reference; a single runFullMatch output remains warning-only.

## Mandatory Diagnosis
- Did this sprint change scoring values? NO.
- Did this sprint delete or cap scoring events? NO.
- Does final score still equal score_change consequences? YES.
- Does a single runFullMatch output remain warning-only? YES.
- Does the 50-match economy remain the global reference? YES.
- Does full-match fatigue now move? YES.
- Does high pressing cost more than balanced pressing? YES.
- Are key moments more diverse? YES.
- Are segment repetition warnings still available? YES.
- Is the report more useful for a coach? YES.
- What remains next: canonical MatchReport contract alignment, deeper tactical plan influence, and richer player stats.

## Recommendations
- CONFIRM_SEGMENT_DIVERSITY_V0
- CONFIRM_FATIGUE_PROPAGATION_V0
- CONFIRM_KEY_MOMENT_DIVERSITY_V0
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_MATCH_REPORT_CONTRACT_ALIGNMENT
- PREPARE_DEEPER_TACTICAL_PLAN_INFLUENCE
