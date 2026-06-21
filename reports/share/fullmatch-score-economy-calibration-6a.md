# Full-Match Score Economy Calibration 6A

Sprint 6A returns to gameplay economy diagnostics after the persistence series. It explains an extreme full-match score as a single-run signal and creates a controlled calibration projection without changing scoring values or rewriting official events.

## Summary
- status: available
- scope: FULL_MATCH_SCORE_ECONOMY_SINGLE_RUN
- calibration version: SCORE_ECONOMY_6A
- official score before calibration: 45 - 0
- official score after calibration: 24 - 0
- score delta home: -21
- score delta away: 0
- scoring event count: 15
- segment count: 8
- sequence count: 48
- finishing opportunity count: 63
- shot goal share: 0
- try touchdown share: 0
- conversion share: 0
- drop goal share: 0
- goalkeeper save rate: 38
- goalkeeper underweighted goal count: 0
- rebound second chance rate: 60
- fatigue error contribution: 63
- dominant team scoring share: 100
- repeated segment amplification risk: MEDIUM
- single-run volatility risk: HIGH
- root-cause primary cause: MIXED_CAUSES
- root-cause secondary causes: TOO_MANY_FINISHING_OPPORTUNITIES, FATIGUE_ERRORS_TOO_PUNITIVE, DEFENSIVE_RESISTANCE_TOO_LOW, SINGLE_RUN_VOLATILITY
- root-cause confidence: medium
- scoring events by family before: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":15}
- scoring events by family after: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":8}
- scoring points by family before: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":45}
- scoring points by family after: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":24}
- selected route mix before: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":15}
- selected route mix after: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":8}
- route success rates before: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":100}
- route success rates after: {"SHOT_GOAL":0,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":53}
- goalkeeper impact before: 38
- goalkeeper impact after: 43
- fatigue impact before: 63
- fatigue impact after: 42
- scoring constants changed: false
- score cap applied: false
- post-hoc score rewrite applied: false
- scoring events deleted: false
- scoring events rewritten: false
- forced opponent score applied: false
- official timeline mutation count: 0
- official possession mutation count: 0
- production scoring event creation count: 0
- batch/live separation preserved: true
- MatchBonusEvent changed: false
- persistence used for calibration: false
- SQLite used as score economy source: false
- FULL_MATCH_BATCH_ECONOMY remains only global economy proof: true
- invented statistic count: 0
- trend proof claim count: 0
- global economy claim count: 0

## Root-Cause Classification
- primary cause: MIXED_CAUSES
- secondary causes: TOO_MANY_FINISHING_OPPORTUNITIES, FATIGUE_ERRORS_TOO_PUNITIVE, DEFENSIVE_RESISTANCE_TOO_LOW, SINGLE_RUN_VOLATILITY
- confidence: medium
- evidence summary: Single-run score economy shows 15 scoring events, 0% SHOT_GOAL point share, 100% dominant-team scoring share, and a maximum of 2 scoring events in one segment.
- affected families: UNKNOWN
- affected segments: segment-1, segment-2, segment-3, segment-4, segment-5, segment-6, segment-7, segment-8
- affected teams: control
- limitations: Single-run signal only; not global economy proof. | Calibration comparison is projected from official events and does not rewrite the official timeline. | FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Calibration Applied
- Reduce repeated scoring-family selection pressure inside a segment.
- Increase defensive resistance and goalkeeper impact in projected clean-shot cases.
- Reduce second-chance amplification when a family dominates the single run.
- Shift fatigue calibration toward offensive precision loss instead of defensive collapse only.

## Before / After Comparison
- official score before: 45 - 0
- projected score after: 24 - 0
- scoring events before: 15
- scoring events after: 8
- finishing opportunities before: 63
- finishing opportunities after: 12
- score cap applied: false
- scoring constants changed: false
- post-hoc rewrite applied: false

## Guardrails
- scoring constants unchanged: true
- score cap applied: false
- post-hoc score rewrite false
- scoring events deleted false
- scoring events rewritten false
- forced opponent score false
- score mutation count 0 outside official generated events
- timeline mutation count 0 outside normal engine generation
- possession mutation count 0 outside normal engine generation
- production scoring event creation count 0 outside official generation path
- batch/live separation preserved true
- MatchBonusEvent unchanged true
- persistence not used for calibration
- SQLite not used as source of score economy
- FULL_MATCH_BATCH_ECONOMY remains only global economy proof
- single-run limitation true

## Recommendation
- KEEP_SCORING_CONSTANTS_AND_CONFIRM_ON_FULL_MATCH_BATCH_BEFORE_GLOBAL_ECONOMY_DECISION

Trace validation status: PASS.
