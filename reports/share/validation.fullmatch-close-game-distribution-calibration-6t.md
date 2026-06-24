# Validation - Full-Match Close Game Distribution Calibration 6T

Status: PASS

## Required Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`

## Checks
- PASS: close game distribution calibration model exists - FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION
- PASS: baseline 6S metrics visible - DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S
- PASS: batch 50 matches after calibration exists - matchCount 50
- PASS: close game audit exists - matches 50
- PASS: score gap cause audit exists - SCORE_GAP_CAUSES_MEASURED, COMPETITIVE_FAILURE_CAUSES_MEASURED, LEADING_TEAM_RUNAWAY_TOO_HIGH
- PASS: closeGameRate measured - 54%
- PASS: competitiveGameRate measured - 80%
- PASS: blowoutRate measured - 14%
- PASS: severeBlowoutRate measured - 0%
- PASS: margin bucket distribution measured - 6
- PASS: scoreline distribution measured - 31
- PASS: trailingTeamResponseRate measured - 8%
- PASS: leadingTeamRunaway measured - 0%
- PASS: chainMetricConsistency measured - true
- PASS: chain metric inconsistency fixed or documented - corrected average is the weighted average of observed same-team opportunity chain lengths across the batch
- PASS: no rubber-banding - false
- PASS: no forced comeback - false
- PASS: no leading team score suppression - false
- PASS: scoringOpportunitiesPerMatch preserved - 15.4
- PASS: scoringEventsPerMatch preserved - 6.8
- PASS: averageTotalPoints preserved - 21
- PASS: severeBlowoutRate preserved - 0%
- PASS: gate selectivity preserved - true
- PASS: earned danger preserved - true
- PASS: automatic danger remains low - true
- PASS: goalkeeper secure gains preserved - true
- PASS: post-score reset preserved - true
- PASS: team opportunity balance preserved - true
- PASS: route family diversity preserved - true
- PASS: TRY route remains available - 26.6%
- PASS: DROP route remains available - 5.3%
- PASS: CONVERSION only after TRY - 10.5% / 26.6%
- PASS: CONTINUATION remains available - continuation present
- PASS: longitudinal close game validation exists - 3
- PASS: longitudinal competitive validation exists - 3
- PASS: longitudinal blowout validation exists - 3
- PASS: calibration coverage preserved - 0
- PASS: score from score_change - true
- PASS: no cap - false
- PASS: no post-hoc rewrite - false
- PASS: no event deletion - false
- PASS: no forced score - false
- PASS: no forced trailing team score - false
- PASS: scoring constants unchanged - false
- PASS: MatchBonusEvent unchanged - false
- PASS: batch/live separation preserved - true
- PASS: no UNKNOWN - 0
- PASS: no PENALTY_SHOT leakage - 0
- PASS: no persistence/SQLite scoring - false/false
- PASS: no contradictory healthy warning when close/competitive distribution remains partial - CLOSE_GAME_DISTRIBUTION_CALIBRATION_COMPLETE, CLOSE_GAME_DISTRIBUTION_MEASURED, SCORE_GAP_CAUSES_MEASURED, COMPETITIVE_FAILURE_CAUSES_MEASURED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, CLOSE_GAME_RATE_IMPROVED, COMPETITIVE_GAME_RATE_IMPROVED, BLOWOUT_RATE_REDUCED, SEVERE_BLOWOUT_STILL_LOW, LATE_GAME_COMPETITION_PRESENT, TRAILING_TEAM_RESPONSE_TOO_LOW, LEADING_TEAM_RUNAWAY_CONTROLLED, CHAIN_METRIC_INCONSISTENCY_FIXED, GATE_SELECTIVITY_PRESERVED, ROUTE_FAMILY_DIVERSITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, FULL_MATCH_BATCH_ECONOMY_HEALTHY
- PASS: PASS/PARTIAL/FAIL justified - PASS

## Counts
- closeGameRateAfter: 54
- competitiveGameRateAfter: 80
- blowoutRateAfter: 14
- severeBlowoutRateAfter: 0
- correctedDominanceChainAverageAfter: 3.3
- chainMetricConsistencyAfter: true
- calibrationCoverageMissingWindowCount: 0
- warnings: CLOSE_GAME_DISTRIBUTION_CALIBRATION_COMPLETE, CLOSE_GAME_DISTRIBUTION_MEASURED, SCORE_GAP_CAUSES_MEASURED, COMPETITIVE_FAILURE_CAUSES_MEASURED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, CLOSE_GAME_RATE_IMPROVED, COMPETITIVE_GAME_RATE_IMPROVED, BLOWOUT_RATE_REDUCED, SEVERE_BLOWOUT_STILL_LOW, LATE_GAME_COMPETITION_PRESENT, TRAILING_TEAM_RESPONSE_TOO_LOW, LEADING_TEAM_RUNAWAY_CONTROLLED, CHAIN_METRIC_INCONSISTENCY_FIXED, GATE_SELECTIVITY_PRESERVED, ROUTE_FAMILY_DIVERSITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, FULL_MATCH_BATCH_ECONOMY_HEALTHY