# Full-Match Route Economy Recheck After Selectivity Fix 6Q

- status: PARTIAL
- scope: FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX
- version: ROUTE_ECONOMY_RECHECK_6Q
- baselineVersion: GATE_SELECTIVITY_VOLUME_6P
- calibrationVersion: ROUTE_ECONOMY_RECHECK_6Q
- matchCount: 50
- recommendation: MONITOR_ROUTE_ECONOMY_PARTIAL
- nextSprintRecommendation: Sprint 6R - Route Economy Longitudinal Validation

## Baseline 6P Summary
- averageTotalPointsBefore: 24.6
- scoringEventsPerMatchBefore: 7.9
- scoringOpportunitiesPerMatchBefore: 17.2
- earnedDangerToScoringOpportunityRateBefore: 100%
- borderlineDangerToScoringOpportunityRateBefore: 100%
- continuationToScoringOpportunityRateBefore: 60.4%
- goalkeeperSecureToDangerAgainstRateBefore: 68.3%

## After Calibration Summary
- averageTotalPointsAfter: 22.7
- scoringEventsPerMatchAfter: 7.3
- scoringOpportunitiesPerMatchAfter: 15.9
- earnedDangerToScoringOpportunityRateAfter: 100%
- borderlineDangerToScoringOpportunityRateAfter: 26.3%
- continuationToScoringOpportunityRateAfter: 0.8%
- goalkeeperSecureToDangerAgainstRateAfter: 3.5%

## Before / After Table
| metric | before | after |
| --- | ---: | ---: |
| averageTotalPoints | 24.6 | 22.7 |
| scoringEventsPerMatch | 7.9 | 7.3 |
| scoringOpportunitiesPerMatch | 17.2 | 15.9 |
| earnedDangerRate | 18.7% | 16.3% |
| borderlineDangerRate | 2.9% | 3.2% |
| automaticDangerSuspicionRate | 0% | 0% |
| severeBlowoutRate | 0% | 0% |

## Route Economy Audit Summary
- routeEconomyWindowCount: 117
- earnedDangerWindowCount: 98
- borderlineDangerWindowCount: 19
- continuationWindowCount: 596
- goalkeeperSecureWindowCount: 370

## Danger Quality Distribution
| quality | count |
| --- | ---: |
| HIGH_QUALITY_DANGER | 116 |
| MEDIUM_QUALITY_DANGER | 1 |

## Danger Outcome Distribution
| outcome | count |
| --- | ---: |
| SCORING_OPPORTUNITY | 103 |
| TERRITORIAL_GAIN | 7 |
| HALF_CHANCE | 4 |
| MOMENTUM_GAIN | 2 |
| FORCED_DEFENSIVE_ACTION | 1 |

## Danger-To-Opportunity Metrics
| metric | before | after |
| --- | ---: | ---: |
| earnedDangerToScoringOpportunityRate | 100% | 100% |
| borderlineDangerToScoringOpportunityRate | 100% | 26.3% |
| highQualityDangerToOpportunityRate | 100% | 88.8% |
| mediumQualityDangerToOpportunityRate | 100% | 10300% |
| lowQualityDangerToOpportunityRate | 100% | 0% |

## Continuation-To-Opportunity Metrics
- continuationToScoringOpportunityRateBefore: 60.4%
- continuationToScoringOpportunityRateAfter: 0.8%

## Goalkeeper Secure Follow-Up
- goalkeeperSecureToDangerAgainstRateBefore: 68.3%
- goalkeeperSecureToDangerAgainstRateAfter: 3.5%
- goalkeeperSecureToSafePossessionRateBefore: 100%
- goalkeeperSecureToSafePossessionRateAfter: 100%
- goalkeeperSecureToAutomaticDangerAgainstRateAfter: 0%

## Volume Preservation Metrics
- halfChanceRateAfter: 3.4%
- forcedDefensiveActionRateAfter: 0.9%
- territorialGainRateAfter: 6%
- momentumGainRateAfter: 0%
- densityCalibrationPreserved: true

## Gate Preservation
- gateSelectivityPreserved: true
- earnedDangerPreserved: true
- automaticDangerStillBlocked: true

## Route Family Mix By Team
| team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 389 | 33 | 23 | 33 | 323 |
| away | 190 | 45 | 38 | 45 | 273 |

## Guardrails
- scoreFromScoreChangeAllRuns: true
- officialPathConnectedAllRuns: true
- calibrationsAppliedAllRuns: true
- scoringConstantsChanged: false
- scoreCapApplied: false
- postHocRewriteApplied: false
- scoringEventsDeleted: false
- forcedOpponentScoreApplied: false
- forcedTrailingTeamScoreApplied: false
- MatchBonusEventChanged: false
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Warnings
- ROUTE_ECONOMY_RECHECK_COMPLETE
- EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH
- BORDERLINE_DANGER_TO_OPPORTUNITY_REDUCED
- CONTINUATION_TO_OPPORTUNITY_REDUCED
- HALF_CHANCE_LAYER_ADDED
- FORCED_DEFENSIVE_ACTION_LAYER_ADDED
- TERRITORIAL_GAIN_LAYER_ADDED
- ROUTE_QUALITY_GATE_CONNECTED
- OPPORTUNITY_QUALITY_GATE_CONNECTED
- GOALKEEPER_SECURE_FOLLOWUP_CLARIFIED
- GATE_SELECTIVITY_PRESERVED
- EARNED_DANGER_PRESERVED
- AUTOMATIC_DANGER_STILL_BLOCKED
- VOLUME_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- TEAM_BALANCE_PRESERVED
- FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Recommendation
- recommendation: MONITOR_ROUTE_ECONOMY_PARTIAL
- nextSprintRecommendation: Sprint 6R - Route Economy Longitudinal Validation
