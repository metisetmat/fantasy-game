# Full-Match Break Event Post-Score Reset Calibration 6K Validation

Status: PASS

## Counts
- matchCount: 50
- postScoreWindowsChecked: 346
- postScoreImmediateReattackRate before/after: 78.4/57.8
- postScoreResetProtectedCount: 79
- dominanceDecayEligibleCount: 346
- dominanceDecayAppliedCount: 454
- defensiveRecoveryBreaksDominanceRate: 34
- goalkeeperSecureBreaksDominanceRate: 0
- recommendation: IMPROVE_GOALKEEPER_SECURE_BREAKS

## Checks
- PASS: post-score reset audit exists - 50
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: 6J baseline visible - DOMINANCE_CHAIN_6J
- PASS: postScoreImmediateReattackRate measured - 57.8%
- PASS: postScoreImmediateReattackRate improves or is explicitly partial - 78.4->57.8
- PASS: postScoreResetProtectedCount measured - 79
- PASS: conceding team first possession measured - 82
- PASS: dominance decay eligible count measured - 346
- PASS: dominance decay applied count active - 454
- PASS: defensive recovery breaks dominance measured - 34%
- PASS: goalkeeper secure break absence is surfaced - 0%
- PASS: dominance chains preserved or improved - 2
- PASS: density calibration preserved - 15.5/21.1
- PASS: team opportunity balance preserved - 70/70
- PASS: route family diversity preserved - 5
- PASS: TRY route remains available
- PASS: DROP route remains available
- PASS: CONVERSION-after-TRY route remains available
- PASS: CONTINUATION route remains available
- PASS: score from score_change
- PASS: no score ceiling mechanism
- PASS: no post-hoc rewrite
- PASS: no event deletion
- PASS: no forced opponent score
- PASS: no forced trailing team score
- PASS: scoring constants unchanged
- PASS: MatchBonusEvent unchanged
- PASS: batch/live separation preserved
- PASS: no UNKNOWN scoring family - 0
- PASS: no PENALTY_SHOT leakage - 0
- PASS: no persistence/SQLite scoring
- PASS: no rollback to SHOT_ONLY
- PASS: warning status is not contradictory - POST_SCORE_IMMEDIATE_REATTACK_REDUCED,POST_SCORE_RESET_PROTECTED,DEFENSIVE_RECOVERY_BREAKS_IMPROVED,GOALKEEPER_SECURE_BREAKS_MISSING,DOMINANCE_DECAY_APPLIED,DENSITY_CALIBRATION_PRESERVED,TEAM_OPPORTUNITY_BALANCE_PRESERVED,ROUTE_FAMILY_DIVERSITY_PRESERVED,BLOWOUT_RATE_STILL_TOO_HIGH,FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share