# Scoring Events Summary

## Summary
- scoring version: V2_DROP_FOUNDATION
- score unit: POINTS
- scoring source: UNIFIED_LIVE_SCORING_EVENTS
- score source label: Échantillon live scoring-events
- score source note: Ce fichier décrit le flux live ScoringEvents de référence. Il reste distinct du score affiché par le rapport full-match si les deux échantillons ne représentent pas le même run.
- batch diagnostics label: Diagnostic batch séparé
- active scoring actions:
  - SHOT_GOAL = 3 points
  - TRY_TOUCHDOWN = 5 points
  - CONVERSION_GOAL = 2 points
  - DROP_GOAL = 2 points
- active match point values:
  - SHOT_GOAL remains 3 match points
  - TRY_TOUCHDOWN remains 5 match points
  - CONVERSION_GOAL remains 2 match points
  - DROP_GOAL remains 2 match points
- inactive scoring actions:
  - PENALTY_SHOT inactive
- final score: CONTROL 3 - 0 BLITZ
- scoring event count: 6
- active scoring event count: 1
- active live scoring events: 1
- DROP_GOAL live events: 0
- non-scoring tactical event count: 5
- recommendation: KEEP_UNIFIED_SCORING_STREAM

## Live Scoring Event Stream

| event id | sequence/action | team | actor | event family | source outcome | scoring action | point value | score before | score after | active | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dt-s4-a4-shot-scoring | Sequence 4 Action 4 | control | control-mobile-lock | SHOT | GOAL | SHOT_GOAL | +3 | CONTROL 0 - 0 BLITZ | CONTROL 3 - 0 BLITZ | YES | CONTROL SHOT_GOAL scoring event links this shot to 3 points. |

## Non-Scoring Live Tactical Events

| sequence/action | team | event family | outcome | active scoring event | point value | reason |
| --- | --- | --- | --- | --- | --- | --- |
| Sequence 2 Action 3 | control | SHOT | MISSED_HIGH | NO | 0 | ML's shot from Z3-HSL resolves as MISSED_HIGH; Goalkeeper tracks the miss across the frame without a failed save action. |
| Sequence 3 Action 4 | control | SHOT | SAVED_BY_GK | NO | 0 | LP's shot from Z5-CL resolves as SAVED_BY_GK; Goalkeeper makes a legal hand save and prevents the shot from scoring. |
| Sequence 5 Action 3 | blitz | SHOT | DEFLECTED_BY_GK | NO | 0 | ML's shot from Z5-C resolves as DEFLECTED_BY_GK; Goalkeeper gets enough reach or reaction to deflect the shot into a rebound state. |
| Sequence 5 Action 4 | blitz | SHOT | DEFLECTED_BY_GK | NO | 0 | ML's shot from Z5-C resolves as DEFLECTED_BY_GK; Goalkeeper gets enough reach or reaction to deflect the shot into a rebound state. |
| Sequence 6 Try Attempt | control | TRY_TOUCHDOWN | LOST_FORWARD | NO | 0 | wide carrier reaches the grounding contest but loses ball control before legal grounding is established. |

## Batch Scoring Diagnostics
- batch try attempts: 22
- batch tries scored: 7
- batch conversion attempts: 7
- batch conversions made: 5
- batch conversion points: 10
- batch drop opportunities: 39
- batch drop candidates generated: 39
- batch drop attempts: 16
- batch drop goals: 6
- batch drop missed: 8
- batch drop blocked: 2
- batch drop invalid: 0
- batch drop success rate: 38%
- batch drop points: 12
- batch scoring note: batch diagnostics remain separate from live score and do not affect current mini-match score.
- batch drop scoring note: batch drop diagnostics do not affect current mini-match score.

## Scoring Choice Balance Snapshot
- shot points: 303
- try points: 35
- conversion points: 10
- drop points: 12
- shot/try/drop balance recommendation: KEEP_SCORING_CHOICE_BALANCE
- route warnings: none
- batch/live separation status: PASS

## Shot Dominance Diagnostic Snapshot
- SHOT_GOAL points share: 84%
- dominant cause: TOO_MANY_SHOT_ATTEMPTS
- recommendation: KEEP_MONITORING
- shot dominance root-cause analysis: active
- root-cause scope: shape vs decision vs resolution; scoring values unchanged.
- non-shot candidate ranking calibration: active
- ranking scope: try/drop/carry/switch/progression candidate competition; scoring values and live ScoringEvents unchanged.
- candidate tie-breaking: active
- tie-breaking scope: equal and near-equal calibrated candidate scores explain selection without changing scoring values or live ScoringEvents.
- route balance monitoring: active
- route balance selected mix: SHOT 13, TRY 17, DROP 4, continuation 4, safe continuity 12
- route balance recommendation: REVIEW_ROUTE_SUCCESS_RATES
- route balance scope: post-ranking batch diagnostics only; live score remains from active ScoringEvents.
- route success calibration: active
- route success snapshot: SHOT 34%, TRY 32%, DROP 38%, CONVERSION 71%
- route success recommendation: KEEP_SUCCESS_RATES, ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION
- route success scope: batch diagnostics only; scoring values and live ScoringEvents unchanged.
- goalkeeper shot-stopping impact calibration: active
- goalkeeper calibration snapshot: projected SHOT 34%, projected CLEAN_SHOT 59%, failed saves 97, GK underweighted goals 0
- goalkeeper calibration recommendation: REVIEW_GK_IMPACT_ON_CLEAN_SHOTS, REVIEW_FAILED_SAVE_THRESHOLDS, REVIEW_THRESHOLD_EDGE_GOALS, KEEP_SHOT_SUCCESS_GLOBAL_BUT_REBALANCE_GK_EFFECT, ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION, NEXT_REVIEW_TRY_GROUNDING_PRESSURE
- goalkeeper calibration scope: batch diagnostic projection only; scoring values and live ScoringEvents unchanged.
- clean shot success calibration: active
- clean shot success snapshot: CLEAN_SHOT 59%, overall SHOT 34%, FORCED_SHOT 0%, threshold-edge clean goals reduced 4
- clean shot success recommendation: KEEP_SCORING_VALUES, REDUCE_THRESHOLD_EDGE_CLEAN_GOALS, INCREASE_STRONG_GK_INFLUENCE_ON_CLEAN_SHOTS, KEEP_FORCED_SHOT_SUPPRESSION, MONITOR_ROUTE_POINT_SHARE_AFTER_CLEAN_SHOT_CALIBRATION, ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION
- clean shot success scope: batch clean-window resolution diagnostics only; scoring values and live ScoringEvents unchanged.
- post-resolution route economy monitoring: active
- route economy snapshot: average total points 6, 0-0 draw rate 38%, scoring draw rate 14%, risks SHOT_POINT_DOMINANCE, TOO_MANY_0_0_DRAWS
- route economy recommendation: KEEP_SCORING_VALUES, KEEP_ROUTE_RESOLUTION_CALIBRATIONS, MONITOR_ROUTE_POINT_SHARE, REVIEW_0_0_DRAW_RATE, REVIEW_STYLE_ROUTE_DIVERSITY, ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING
- route economy scope: batch monitoring only; scoring values and live ScoringEvents unchanged.
- danger phase conversion economy: active
- danger phase economy snapshot: sterile danger phases 19, danger-to-score conversion 62%, 0-0 draw rate 38%, risks SHOT_POINT_DOMINANCE, TOO_MANY_0_0_DRAWS, STERILE_DANGER_PHASES, ROUTE_RESOLUTION_NOT_PRIMARY_CAUSE
- danger phase economy recommendation: KEEP_SCORING_VALUES, REVIEW_DANGER_TO_SCORE_CONVERSION, REVIEW_STERILE_DANGER_PHASES, REVIEW_0_0_DRAW_RATE, REVIEW_STYLE_ROUTE_DIVERSITY, IMPROVE_CONTINUATION_PAYOFF, ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY
- danger phase economy scope: batch monitoring only; scoring values and live ScoringEvents unchanged.
- continuation payoff calibration: active
- continuation payoff snapshot: projected sterile danger rate 16%, SUPPORT_CLUSTER_RECYCLE payoff 75%, FORWARD_PROGRESS payoff 67%
- continuation payoff recommendation: KEEP_SCORING_VALUES, IMPROVE_CONTINUATION_PAYOFF, REVIEW_OVER_SAFE_CONTINUATION, REVIEW_0_0_DRAW_RATE, MONITOR_DANGER_TO_SCORE_CONVERSION, REVIEW_STYLE_ROUTE_DIVERSITY, ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF
- continuation payoff scope: batch monitoring only; future route quality changes do not add live scoring events.
- match duration possession volume calibration: active
- match volume snapshot: interpretation FULL_LENGTH_MATCH, calibrated possessions 30, calibrated danger phases 43.5, projected 0-0 3%
- match volume recommendation: KEEP_SCORING_VALUES, CALIBRATE_FULL_MATCH_VOLUME, REDUCE_UNDER_SAMPLED_0_0, REVIEW_POSSESSION_VOLUME, REVIEW_DANGER_PHASE_VOLUME, REVIEW_STYLE_SCORING_VOLUME, PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY, ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION
- match volume scope: batch projection only; no forced live scoring events.
- full-match economy validation: active
- full-match economy snapshot: observed 0-0 4%, average points 33, unique final scores 38, risks none
- full-match economy recommendation: KEEP_SCORING_VALUES, CALIBRATE_TRY_ATTRITION, REVIEW_LOST_FORWARD_OVERPUNISHMENT, REWARD_HIGH_QUALITY_LEGAL_ACCESS, PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE, PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT, MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION, MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION, REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH, BONUS_DESIGN_READY, KEEP_BONUSES_OUT_OF_MATCH_SCORE, KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY, USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE, CONFIRM_LEAGUE_TABLE_INTEGRATION, CONFIRM_LEAGUE_POINTS_SUMMARY, RECOMMEND_OFFENSIVE_BONUS_MODEL, RECOMMEND_DEFENSIVE_BONUS_MODEL, VALIDATE_BONUS_TRIGGER_RATE_BEFORE_IMPLEMENTATION, DO_NOT_USE_BONUSES_TO_MASK_ROUTE_IMBALANCE, PREPARE_BONUS_IMPLEMENTATION_SPRINT_AFTER_AUDIT, VALIDATE_4_2_0_MINUS_1_TABLE, SIMULATE_BONUS_TRIGGER_RATES, REVIEW_3_SCORING_FAMILIES_BONUS_VALUE, REVIEW_CLOSE_LOSS_THRESHOLD, REVIEW_NO_GOAL_NO_TRY_OR_VS_AND, REVIEW_BONUS_STACKING_CAP, KEEP_BONUSES_OUT_OF_LIVE_SCORE, USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE, PREPARE_LEAGUE_TABLE_INTEGRATION, EXCLUDE_CONVERSION_FROM_ROUTE_FAMILY_BONUS_IF_CONFIRMED, CONFIRM_3_TRY_OFFENSIVE_BONUS, CONFIRM_3_MAIN_SCORING_FAMILIES_BONUS, CONFIRM_CLOSE_LOSS_7_POINTS, CONFIRM_MAJOR_THREAT_DEFENSIVE_BONUS, CONFIRM_BONUS_CAP_PLUS_2, CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES, CONFIRM_FATIGUE_EFFECT_CALIBRATION, MONITOR_FATIGUE_OUTCOME_IMPACT, REVIEW_HIGH_LOAD_STYLE_COST, REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE, MONITOR_CONTROL_DIRECT_AND_BLITZ_RISKY_FATIGUE_COST, REVIEW_CONTROL_BALANCED_BONUS_VISIBILITY, CONFIRM_ROSTER_QUALITY_MODEL_V1, MONITOR_ROSTER_QUALITY_BONUS_CORRELATION, CONFIRM_ROSTER_STRESS_TESTS, CONFIRM_WEAK_BUILDS_FAIL_FOR_RIGHT_REASONS, CONFIRM_PLAYER_LOAD_BALANCING_IF_HEALTHY, CONFIRM_ROLE_ECONOMY_IF_HEALTHY, MONITOR_BONUS_STYLE_FAIRNESS_WITH_STRESSED_ROSTERS, MONITOR_SPECIALIST_DEPENDENCY_COST, MONITOR_BENCH_DEPTH_COST, MONITOR_MANDATORY_ROLE_RISKS, MONITOR_INVISIBLE_ROLE_RISKS, IMPROVE_COACH_ROLE_GUIDE_ITERATIVELY, REVIEW_HIGH_SPECIALIST_DEPENDENCY_COST, REVIEW_GK_MENTAL_LOAD_COST, REVIEW_GK_MENTAL_ROLE_CLARITY, REVIEW_GK_MENTAL_RELIABILITY_IMPACT, PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT, PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT, PREPARE_LEAGUE_TABLE_INTEGRATION, ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION
- shot/rebound/half-space guardrail: clean angled windows remain calibrated locally; forced/narrow/desperate half-space shots remain difficult.
- full-match economy scope: batch validation only; live score remains from active ScoringEvents.
- bonus readiness audit: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE.
- bonus source-of-truth guardrail: bonuses use separate MatchBonusEvent records and league-table points only, not live ScoringEvents.
- league points bonus implementation: WIN 4 / DRAW 2 / LOSS 0 / FORFEIT -1 base points plus post-final-whistle MatchBonusEvents.
- bonus rule refinement applied: 3+ tries and conversion-excluded three-main-family bonus are implemented in MatchBonusEvent V1.
- MatchBonusEvent is not part of this live ScoringEvent stream.
- bonus points do not alter match score.
- league table integration: generated from LeaguePointsSummary.
- fatigue bonus correlation instrumentation: AVAILABLE_WITH_REAL_VALUES.
- fatigue/load/roster schemas: PlayerFatigueTimelineRow / TeamFatigueTimelineRow / TeamMatchFatigueSummary / PlayerMatchLoadSummary / TeamLoadSummary / LateMatchPerformanceSummary / RosterQualitySummary remain outside live ScoringEvents.
- roster stress test guardrail: weak-build variants are diagnostics only and never create active ScoringEvents or live match points.
- player load balancing guardrail: load tuning diagnostics never create ScoringEvents, alter live score, change scoring values, or replace production rosters.
- role economy guardrail: role taxonomy, role documentation, and role-value diagnostics never create ScoringEvents, alter live score, change scoring values, or make non-GK roles universally mandatory.
- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1; fatigue audits influence interpretation and regression monitoring, not live ScoringEvent totals.
- try attrition calibration: active
- try attrition snapshot: TRY 32%, contested TRY 32%, LOST_FORWARD 6, HELD_UP 2, TACKLED_SHORT 7
- try attrition recommendation: KEEP_SCORING_VALUES, REVIEW_TRY_GROUNDING_PRESSURE, KEEP_HELD_UP_UNDER_GOAL_LINE_PRESSURE, KEEP_TACKLED_SHORT_UNDER_POOR_SUPPORT, MONITOR_SHOT_DOMINANCE_AFTER_TRY_CALIBRATION, ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION
- try attrition scope: batch route-resolution diagnostics only; scoring values and live ScoringEvents unchanged.
- batch/live separation status: batch diagnostics remain separate from live score
- canonical diagnostic report: shot-dominance-diagnostic.md

## Scoring Affordance Volume Snapshot
- known scoring affordances excluding conversion: 393
- known scoring affordances per match: 7.86
- known scoring affordances per team per match: 3.93
- non-shot affordance share: 27%
- affordance volume recommendation: INSTRUMENT_DANGER_PHASES
- batch/live separation status: batch diagnostics remain separate from live score

## Offensive Possession / Danger Phase Snapshot
- offensive possessions per match: 6
- danger phases per match: 8.7
- danger phase to scoring affordance rate: 90%
- danger phase instrumentation recommendation: KEEP_INSTRUMENTATION
- batch/live separation status: batch diagnostics remain separate from live score

## Danger Phase Non-Shot Affordance Snapshot
- TRY_TOUCHDOWN affordances: 66
- DROP_GOAL affordances: 39
- non-shot setup affordances: 60
- non-shot affordance share: 27%
- recommendation: KEEP_NON_SHOT_AFFORDANCE_MODEL
- batch/live separation status: batch diagnostics remain separate from live score

## Non-Shot Resolution Rebalance Snapshot
- conversion attempts: 7
- conversions made: 5
- conversion success rate: 71%
- conversion recommendation: KEEP_CONVERSION_MODEL
- drop attempts: 16
- drop goals: 6
- drop success rate: 38%
- drop recommendation: KEEP_DROP_MODEL_BUT_MONITOR
- try attempts: 22
- tries scored: 7
- try scoring rate: 32%
- try recommendation: KEEP_TRY_ATTEMPT_MODEL
- batch/live separation status: PASS

## Team Shape Intent Calibration Note
- team shape intent calibration does not change scoring events.
- team shape intent generalization does not change scoring events.
- live score remains from active ScoringEvents.
- batch/live separation preserved.

## Score Consistency Checks
- final score from event stream: CONTROL 3 - 0 BLITZ
- final score reported: CONTROL 3 - 0 BLITZ
- mismatch count: 0
- batch/live contamination count: 0
- inactive scoring leakage count: 0
