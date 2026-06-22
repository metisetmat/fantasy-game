# Full-Match Calibration Carryover Reconciliation 6C Validation

Status: PASS

## Checks
- PASS: calibration carryover model is available. - available
- PASS: scope is single-run diagnostic. - FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN
- PASS: official full-match score is visible. - 45 - 0
- PASS: official scoring event count is visible. - 15
- PASS: official SHOT_GOAL count is visible. - 15
- PASS: calibration carryover matrix is present. - 10
- PASS: batch/live/full-match scoring path audit is present. - 5
- PASS: historical batch calibration references are visible. - 2/35
- PASS: shot difficulty calibration is not claimed as full-match applied.
- PASS: scoring choice balance is not claimed as full-match applied.
- PASS: affordance volume constraints are not claimed as full-match applied.
- PASS: primary regression cause is parallel scoring path. - FULLMATCH_PARALLEL_SCORING_PATH
- PASS: warnings include missing shot difficulty calibration.
- PASS: warnings include route family competition missing.
- PASS: warnings include diagnostic-only scope.
- PASS: warnings include global economy not proven.
- PASS: coach export contains Reconciliation des calibrations.
- PASS: coach export states diagnostic single-run.
- PASS: coach export states no score modification.
- PASS: scoring constants unchanged.
- PASS: no score cap.
- PASS: no post-hoc rewrite.
- PASS: no scoring event deletion.
- PASS: no scoring event rewrite.
- PASS: no forced opponent score.
- PASS: no official timeline mutation. - 0
- PASS: no official possession mutation. - 0
- PASS: batch/live separation preserved.
- PASS: MatchBonusEvent unchanged.
- PASS: persistence not used for calibration.
- PASS: SQLite not used as score economy source.
- PASS: no invented stats. - 0
- PASS: no global economy claim from single run. - 0
- PASS: no trend proof claim. - 0
- PASS: FULL_MATCH_BATCH_ECONOMY remains only global proof.
- PASS: trace validation model remains available. - available
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
- status: available
- scope: FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN
- version: CALIBRATION_CARRYOVER_6C
- official full-match score: 45 - 0
- official full-match scoring events: 15
- official full-match SHOT_GOAL events: 15
- official full-match SHOT_GOAL points: 45
- batch calibration known SHOT_GOAL per match: 2
- batch calibration known conversion rate: 35
- shot difficulty calibration applied in batch: true
- shot difficulty calibration applied in full-match: false
- scoring choice balance applied in batch: true
- scoring choice balance applied in full-match: false
- scoring affordance volume applied in batch: true
- scoring affordance volume applied in full-match: false
- goalkeeper calibration applied in batch: true
- goalkeeper calibration applied in full-match: false
- rebound calibration applied in batch: true
- rebound calibration applied in full-match: false
- fatigue calibration applied in batch: true
- fatigue calibration applied in full-match: false
- route family mix applied in batch: true
- route family mix applied in full-match: false
- full-match uses parallel scoring path: true
- full-match uses legacy shot path: true
- full-match uses fallback route path: true
- full-match uses segment amplification path: true
- primary regression cause: FULLMATCH_PARALLEL_SCORING_PATH
- secondary regression causes: FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION, FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE, FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS, FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED, FULLMATCH_SEGMENT_AMPLIFICATION_RISK
- confidence: high
- carryover matrix rows: 10
- scoring path audit rows: 5
- warnings: FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION, FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE, FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS, FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING, FULLMATCH_SHOT_GOAL_MONO_FAMILY, FULLMATCH_SEGMENT_AMPLIFICATION_RISK, FULLMATCH_PARALLEL_SCORING_PATH, FULLMATCH_LEGACY_SCORING_PATH, FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED, FULLMATCH_DEFENSIVE_RESISTANCE_NOT_APPLIED, FULLMATCH_FATIGUE_OFFENSIVE_PRECISION_NOT_APPLIED, FULLMATCH_DANGER_PHASE_NOT_CONNECTED, CALIBRATION_DIAGNOSTIC_ONLY, GLOBAL_ECONOMY_NOT_PROVEN
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
- global economy claim count: 0
- trend proof claim count: 0
- invented statistic count: 0
- single-run only: true
- FULL_MATCH_BATCH_ECONOMY remains only global proof: true
- recommendation: PREPARE_6D_CONNECT_FULLMATCH_TO_VALIDATED_SCORING_CALIBRATIONS

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- PREPARE_6D_CONNECT_FULLMATCH_TO_VALIDATED_SCORING_CALIBRATIONS
