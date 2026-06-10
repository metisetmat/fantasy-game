# Full-Match Harness Plausibility

Sprint 2O makes lopsided deterministic full-match harness output more explainable without changing scoring values or rewriting events.

## Why 51-0 Remains Warning-Only
- A single runFullMatch output is scoped as FULL_MATCH_HARNESS_SINGLE_RUN.
- It can expose harness/report plausibility issues, but it cannot invalidate FULL_MATCH_BATCH_ECONOMY.
- The validated 50-match economy remains the global scoring reference.
- The 50-match economy remains the global reference for scoring economy decisions.

## Scoring Dominance Diagnostics Added
- Added FullMatchScoringDominanceReport with warning-only scope.
- Detects one-team scoring dominance, zero scoring events for one team, high scoring event counts, repeated scoring zones, repeated scoring families, repeated segment patterns, dominated-team danger without score, dominated-team pressure without conversion, and high load with no payoff.
- Diagnostics never delete, cap, hide, or rewrite scoring events.
- Diagnostics never recommend changing scoring values from a single harness run.

## Dominated-Team Evidence
- Match evidence now creates a dominated-team no-payoff fact when a team has zero scoring events but still produces pressure, progression, danger, or instability signals in a large-margin match.
- The coach insight asks whether the dominated team lacks final-action support, route selection after pressure, stability platform, or target-zone variety.

## Key Moment Signal Quality
- Key moments remain capped at five.
- No more than two key moments may share the same title when alternatives exist.
- Dominated-team, momentum/lopsided-score, pressure, and instability signals can appear beside scoring moments.

## Fatigue And Load Scale
- High-intensity load now has more headroom so both teams do not automatically saturate at 100.
- Pressing intensity, risk, pressure events, second-half status, conceded scoring, and defensive stress all contribute.
- The higher-pressing team remains at least as loaded as the balanced team, while condition still declines for both teams.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.

## Mandatory Diagnosis
- Did this sprint change scoring values? NO.
- Did this sprint delete or cap scoring events? NO.
- Does final score still equal score_change consequences? YES.
- Does one-team scoring dominance remain warning-only? YES.
- Does zero scoring team remain warning-only? YES.
- Does the report explain why 51-0 is a harness plausibility warning? YES.
- Does the dominated team now have visible evidence/insight when applicable? YES.
- Are key moments less repetitive? YES.
- Is fatigue/load contrast more useful? YES.
- Does the 50-match economy remain the global reference? YES.
- What remains next: canonical MatchReport contract alignment, deeper tactical plan influence, real player stats, or true segment state integration into mini-match resolution.

## Recommendations
- CONFIRM_SCORING_DOMINANCE_DIAGNOSTICS_V0
- CONFIRM_DOMINATED_TEAM_SIGNAL_V0
- CONFIRM_REPORT_SIGNAL_QUALITY_IMPROVED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_CANONICAL_MATCHREPORT_ALIGNMENT
- PREPARE_TRUE_SEGMENT_STATE_INTEGRATION
