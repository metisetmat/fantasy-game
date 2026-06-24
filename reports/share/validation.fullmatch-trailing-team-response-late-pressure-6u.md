# Validation - Full-Match Trailing Team Response & Late Game Pressure 6U

Status: PARTIAL

## Required Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`

## Checks
- PASS: trailing team response late pressure model exists - FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE
- PASS: baseline 6T metrics visible - CLOSE_GAME_DISTRIBUTION_6T
- PASS: batch 50 matches after calibration exists - matchCount 50
- PASS: unique seeds measured - 50
- PASS: score from score_change all runs - true
- PASS: official path connected all runs - true
- PASS: scoring constants unchanged - false
- PASS: MatchBonusEvent unchanged - false
- PASS: no cap - false
- PASS: no post-hoc rewrite - false
- PASS: no event deletion - false
- PASS: no forced score - false
- PASS: no forced trailing team score - false
- PASS: no rubber-banding - false
- PASS: no forced comeback - false
- PASS: no leading team score suppression - false
- PASS: no trailing team opportunity forced - false
- PASS: no trailing team score change injected - false
- PASS: no UNKNOWN - 0
- PASS: PENALTY_SHOT inactive - 0
- PASS: no persistence/SQLite scoring - false/false
- PASS: route family diversity preserved - true
- PASS: TRY/DROP still present - TRY and DROP present
- PASS: CONTINUATION still present - continuation present
- PASS: goalkeeper secure reset preserved - true
- PASS: post-score reset preserved - true
- PASS: gate selectivity preserved - true
- PASS: earned danger preserved - true
- PASS: automatic danger remains low - true
- PASS: dominance chain max stays <= 4 - 4
- PASS: chain metric consistency stays true - true
- PASS: calibration coverage complete - 0
- PASS: trailingTeamResponseRate increases materially from 8% - 50.6%
- PASS: trailingTeamResponseRate target ideally >=35% - 50.6%
- PASS: trailingTeamResponseCauseDistribution measured - 6
- PASS: lateGamePressure measured - 14.3%
- PASS: closeGameRate preserved or explicitly partial - 42%
- PASS: competitiveGameRate preserved in healthy range - 82%
- PASS: blowout/severe blowout preserved - 8% / 0%
- PASS: averageTotalPoints remains healthy - 21.8
- PASS: scoringEventsPerMatch remains healthy - 7.1
- PASS: scoringOpportunitiesPerMatch remains healthy - 16.3
- PASS: no contradictory healthy warning if trailing response remains too low - TRAILING_TEAM_RESPONSE_FOLLOWUP_COMPLETE, TRAILING_TEAM_RESPONSE_MEASURED, LATE_GAME_PRESSURE_MEASURED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, TRAILING_TEAM_RESPONSE_RESTORED, TRAILING_TEAM_RESPONSE_HEALTHY, TRAILING_TEAM_RESPONSE_CAUSES_MEASURED, LATE_GAME_PRESSURE_HEALTHY, CLOSE_GAME_RATE_REGRESSED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, FINAL_QUARTER_COMPETITION_PRESERVED, GATE_SELECTIVITY_PRESERVED, ROUTE_FAMILY_DIVERSITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, FULL_MATCH_BATCH_ECONOMY_PARTIAL
- PASS: PASS/PARTIAL/FAIL justified - PARTIAL

## Counts
- trailingTeamResponseRateBefore: 8
- trailingTeamResponseRateAfter: 50.6
- trailingTeamOpportunityShareAfter: 21.4
- trailingTeamScoringShareAfter: 0
- trailingTeamRecoveryShareAfter: 9
- trailingTeamPressureReliefRateAfter: 46
- lateGamePressureRateAfter: 14.3
- closeGameRateAfter: 42
- competitiveGameRateAfter: 82
- blowoutRateAfter: 8
- severeBlowoutRateAfter: 0
- dominantTeamOpportunityChainMaxAfter: 4
- chainMetricConsistencyAfter: true
- calibrationCoverageMissingWindowCount: 0
- warnings: TRAILING_TEAM_RESPONSE_FOLLOWUP_COMPLETE, TRAILING_TEAM_RESPONSE_MEASURED, LATE_GAME_PRESSURE_MEASURED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, TRAILING_TEAM_RESPONSE_RESTORED, TRAILING_TEAM_RESPONSE_HEALTHY, TRAILING_TEAM_RESPONSE_CAUSES_MEASURED, LATE_GAME_PRESSURE_HEALTHY, CLOSE_GAME_RATE_REGRESSED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, FINAL_QUARTER_COMPETITION_PRESERVED, GATE_SELECTIVITY_PRESERVED, ROUTE_FAMILY_DIVERSITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, FULL_MATCH_BATCH_ECONOMY_PARTIAL