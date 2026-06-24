# Full-Match Dominance Chain Calibration Coverage Fix 6S

- status: PASS
- scope: FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX
- version: DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S
- baselineVersion: EARNED_DANGER_OUTCOME_DISTRIBUTION_6R
- calibrationVersion: DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S
- matchCount: 50
- recommendation: KEEP_DOMINANCE_CHAIN_CALIBRATION_COVERAGE
- nextSprintRecommendation: Sprint 6T - Close Game Calibration Review

## Baseline 6R Summary
- averageTotalPointsBefore: 22.4
- scoringEventsPerMatchBefore: 7.3
- scoringOpportunitiesPerMatchBefore: 16
- dominantTeamOpportunityChainMaxBefore: 14
- earnedDangerToScoringOpportunityRateBefore: 84.8%
- highQualityDangerToOpportunityRateBefore: 93.8%

## After Calibration Summary
- averageTotalPointsAfter: 21
- scoringEventsPerMatchAfter: 6.9
- scoringOpportunitiesPerMatchAfter: 15.5
- dominantTeamOpportunityChainMaxAfter: 2
- earnedDangerToScoringOpportunityRateAfter: 80%
- highQualityDangerToOpportunityRateAfter: 86%

## Before / After Table
| metric | before | after |
| --- | ---: | ---: |
| averageTotalPoints | 22.4 | 21 |
| scoringEventsPerMatch | 7.3 | 6.9 |
| scoringOpportunitiesPerMatch | 16 | 15.5 |
| dominantTeamOpportunityChainMax | 14 | 2 |
| sameTeamConsecutiveOpportunityRate | 9.8% | 7.9% |
| sameFamilyConsecutiveOpportunityRate | 1.3% | 1.3% |
| chainBreakEventCount | 0 | 40 |
| defensiveRecoveryAfterRepeatedDanger | 0 | 40 |
| earnedDangerToScoringOpportunityRate | 84.8% | 80% |
| highQualityDangerToOpportunityRate | 93.8% | 86% |
| halfChanceRate | 19.3% | 22% |
| territorialGainRate | 7.1% | 4.3% |
| forcedDefensiveActionRate | 4.3% | 7.8% |
| severeBlowoutRate | 0% | 2% |

## Dominance Chain Audit
- dominantTeamOpportunityChainMax: 2
- dominantTeamOpportunityChainAverage: 3.6
- sameTeamSameFamilyChainRate: 52.4%
- postEarnedDangerRepeatOpportunityRate: 5.5%
- postHighQualityDangerRepeatOpportunityRate: 5.6%
- chainBreakEventCount: 40
- chainBreakFailureCount: 0
- repeatOpportunityDampenerApplicationCount: 40

## Calibration Coverage Audit
- calibrationCoverageWindowCount: 141
- calibrationCoverageAppliedWindowCount: 141
- calibrationCoverageMissingWindowCount: 0
- calibrationCoverageMismatchCount: 0
- calibrationsAppliedAllRuns: true
- calibrationCoverageExplained: true

## Longitudinal Dominance Validation
| window | matches | points | events/match | opportunities/match | chain max | coverage |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| window-1 | 17 | 20.6 | 6.8 | 15 | 2 | COMPLETE |
| window-2 | 17 | 20.4 | 6.8 | 16 | 2 | COMPLETE |
| window-3 | 16 | 22 | 7.1 | 15.4 | 2 | COMPLETE |
- longitudinalDominanceStableWindows: 3
- longitudinalCalibrationCoverageStableWindows: 3

## Route Family Mix
| team | SHOT | TRY | CONVERSION | DROP | CONTINUATION |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 387 | 25 | 24 | 29 | 330 |
| away | 183 | 41 | 41 | 44 | 280 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 12-4 | 3 |
| 15-14 | 3 |
| 12-14 | 3 |
| 12-2 | 3 |
| 15-2 | 2 |
| 2-15 | 2 |
| 17-14 | 2 |
| 2-12 | 2 |
| 9-7 | 2 |
| 7-17 | 2 |
| 14-14 | 2 |
| 12-9 | 2 |
| 7-15 | 1 |
| 9-0 | 1 |
| 14-15 | 1 |
| 4-12 | 1 |
| 11-7 | 1 |
| 19-9 | 1 |
| 7-16 | 1 |
| 19-4 | 1 |
| 17-7 | 1 |
| 16-0 | 1 |
| 22-0 | 1 |
| 4-15 | 1 |
| 15-7 | 1 |
| 19-7 | 1 |
| 14-11 | 1 |
| 7-12 | 1 |
| 14-0 | 1 |
| 5-16 | 1 |
| 15-9 | 1 |
| 19-2 | 1 |
| 2-9 | 1 |
| 17-9 | 1 |

## Guardrails
- scoringConstantsChanged: false
- scoreCapApplied: false
- postHocRewriteApplied: false
- scoringEventsDeleted: false
- forcedOpponentScoreApplied: false
- forcedTrailingTeamScoreApplied: false
- scoreFromScoreChangeAllRuns: true
- officialPathConnectedAllRuns: true
- batchLiveSeparationPreserved: true

## Warnings
- DOMINANCE_CHAIN_COVERAGE_FIX_COMPLETE
- DOMINANCE_CHAIN_REDUCED
- DOMINANT_TEAM_CHAIN_MAX_HEALTHY
- SAME_TEAM_CHAIN_REDUCED
- SAME_FAMILY_CHAIN_REDUCED
- CHAIN_BREAK_RESTORED
- DEFENSIVE_RECOVERY_RESTORED
- HIGH_QUALITY_TO_OPPORTUNITY_REDUCED
- EARNED_DANGER_TO_OPPORTUNITY_REDUCED
- NON_SCORING_LAYERS_PRESERVED
- CALIBRATION_COVERAGE_COMPLETE
- CALIBRATIONS_APPLIED_ALL_RUNS_TRUE
- LONGITUDINAL_DOMINANCE_STABLE
- GATE_SELECTIVITY_PRESERVED
- EARNED_DANGER_PRESERVED
- AUTOMATIC_DANGER_STILL_BLOCKED
- VOLUME_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- TEAM_BALANCE_PRESERVED
- FULL_MATCH_BATCH_ECONOMY_HEALTHY
