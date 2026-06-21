# Full-Match Score Economy Calibration 6A Validation

Status: PASS

## Checks
- PASS: diagnostic root-cause is available. - MIXED_CAUSES
- PASS: before/after comparison is available. - 15/8
- PASS: after calibration is less extreme or explained. - 45 - 0 -> 24 - 0
- PASS: scoring constants unchanged.
- PASS: no score cap.
- PASS: no post-hoc rewrite.
- PASS: no event deletion.
- PASS: no event rewrite.
- PASS: no forced opponent score.
- PASS: warnings available. - 3
- PASS: report section visible.
- PASS: no invented stats. - 0
- PASS: no global proof claim. - 0
- PASS: no trend proof claim. - 0
- PASS: batch/live separation preserved.
- PASS: MatchBonusEvent unchanged.
- PASS: persistence not used for calibration.
- PASS: SQLite not used as source of score economy.
- PASS: FULL_MATCH_BATCH_ECONOMY remains only global proof.
- PASS: share model remains single-run only.
- PASS: trace validation model remains available. - available
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
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

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- KEEP_SCORING_CONSTANTS_AND_CONFIRM_ON_FULL_MATCH_BATCH_BEFORE_GLOBAL_ECONOMY_DECISION
