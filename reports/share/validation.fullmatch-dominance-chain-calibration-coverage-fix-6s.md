# Validation - Full-Match Dominance Chain Calibration Coverage Fix 6S

Status: PASS

## Required Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`

## Checks
- PASS: dominance chain calibration coverage fix model exists - FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX
- PASS: baseline 6R metrics visible - EARNED_DANGER_OUTCOME_DISTRIBUTION_6R
- PASS: batch 50 matches after calibration exists - matchCount 50
- PASS: dominance chain audit exists - max 2
- PASS: calibration coverage audit exists - windows 141
- PASS: dominantTeamOpportunityChainMax measured and reduced or failure justified - 14 -> 2
- PASS: sameTeamConsecutiveOpportunityRate measured - 7.9%
- PASS: sameFamilyConsecutiveOpportunityRate measured - 1.3%
- PASS: chain break events measured - 40
- PASS: calibrationsAppliedAllRuns measured - true
- PASS: calibrationCoverageAppliedWindowCount measured - 141
- PASS: calibrationCoverageMissingWindowCount measured - 0
- PASS: calibrationCoverageMismatchCount measured - 0
- PASS: calibrationsAppliedAllRuns true OR false fully explained - true
- PASS: highQualityDangerToOpportunityRate measured - 86%
- PASS: highQualityDangerToOpportunityRate reduced or justified - 93.8% -> 86%
- PASS: non-scoring layers preserved - 22/4.3/7.8
- PASS: scoringOpportunitiesPerMatch preserved - 15.5
- PASS: scoringEventsPerMatch preserved - 6.9
- PASS: averageTotalPoints preserved - 21
- PASS: severeBlowoutRate preserved - 2%
- PASS: gate selectivity preserved - true
- PASS: earned danger preserved - true
- PASS: automatic danger remains low - true
- PASS: goalkeeper secure gains preserved - true
- PASS: post-score reset preserved - true
- PASS: team opportunity balance preserved - true
- PASS: route family diversity preserved - true
- PASS: TRY route remains available - TRY present
- PASS: DROP route remains available - DROP present
- PASS: CONVERSION only after TRY - conversion <= try
- PASS: CONTINUATION remains available - continuation present
- PASS: longitudinal dominance validation exists - 3
- PASS: longitudinal calibration coverage validation exists - 3
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
- PASS: no contradictory healthy warning when dominance or calibration coverage remains partial - DOMINANCE_CHAIN_COVERAGE_FIX_COMPLETE, DOMINANCE_CHAIN_REDUCED, DOMINANT_TEAM_CHAIN_MAX_HEALTHY, SAME_TEAM_CHAIN_REDUCED, SAME_FAMILY_CHAIN_REDUCED, CHAIN_BREAK_RESTORED, DEFENSIVE_RECOVERY_RESTORED, HIGH_QUALITY_TO_OPPORTUNITY_REDUCED, EARNED_DANGER_TO_OPPORTUNITY_REDUCED, NON_SCORING_LAYERS_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, CALIBRATIONS_APPLIED_ALL_RUNS_TRUE, LONGITUDINAL_DOMINANCE_STABLE, GATE_SELECTIVITY_PRESERVED, EARNED_DANGER_PRESERVED, AUTOMATIC_DANGER_STILL_BLOCKED, VOLUME_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, TEAM_BALANCE_PRESERVED, FULL_MATCH_BATCH_ECONOMY_HEALTHY
- PASS: PASS/PARTIAL/FAIL justified - PASS

## Counts
- dominantTeamOpportunityChainMaxBefore: 14
- dominantTeamOpportunityChainMaxAfter: 2
- chainBreakEventCountAfter: 40
- calibrationCoverageWindowCount: 141
- calibrationCoverageAppliedWindowCount: 141
- calibrationCoverageMissingWindowCount: 0
- calibrationCoverageMismatchCount: 0
- warnings: DOMINANCE_CHAIN_COVERAGE_FIX_COMPLETE, DOMINANCE_CHAIN_REDUCED, DOMINANT_TEAM_CHAIN_MAX_HEALTHY, SAME_TEAM_CHAIN_REDUCED, SAME_FAMILY_CHAIN_REDUCED, CHAIN_BREAK_RESTORED, DEFENSIVE_RECOVERY_RESTORED, HIGH_QUALITY_TO_OPPORTUNITY_REDUCED, EARNED_DANGER_TO_OPPORTUNITY_REDUCED, NON_SCORING_LAYERS_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, CALIBRATIONS_APPLIED_ALL_RUNS_TRUE, LONGITUDINAL_DOMINANCE_STABLE, GATE_SELECTIVITY_PRESERVED, EARNED_DANGER_PRESERVED, AUTOMATIC_DANGER_STILL_BLOCKED, VOLUME_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, TEAM_BALANCE_PRESERVED, FULL_MATCH_BATCH_ECONOMY_HEALTHY
