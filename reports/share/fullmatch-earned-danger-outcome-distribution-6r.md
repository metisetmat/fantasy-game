# Full-Match Earned Danger Outcome Distribution 6R

- status: PARTIAL
- scope: FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY
- version: EARNED_DANGER_OUTCOME_DISTRIBUTION_6R
- baselineVersion: ROUTE_ECONOMY_RECHECK_6Q
- calibrationVersion: EARNED_DANGER_OUTCOME_DISTRIBUTION_6R
- matchCount: 50
- recommendation: MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION
- nextSprintRecommendation: Sprint 6S - Earned Danger Outcome Tuning Review

## Baseline 6Q Summary
- averageTotalPointsBefore: 22.7
- scoringEventsPerMatchBefore: 7.3
- scoringOpportunitiesPerMatchBefore: 15.9
- earnedDangerToScoringOpportunityRateBefore: 100%
- highQualityDangerToOpportunityRateBefore: 88.8%
- mediumQualityDangerCountBefore: 1
- lowQualityDangerCountBefore: 0

## After Calibration Summary
- averageTotalPointsAfter: 22.4
- scoringEventsPerMatchAfter: 7.3
- scoringOpportunitiesPerMatchAfter: 16
- earnedDangerToScoringOpportunityRateAfter: 84.8%
- highQualityDangerToOpportunityRateAfter: 93.8%
- mediumQualityDangerCountAfter: 36
- lowQualityDangerCountAfter: 7

## Before / After Table
| metric | before | after |
| --- | ---: | ---: |
| averageTotalPoints | 22.7 | 22.4 |
| scoringEventsPerMatch | 7.3 | 7.3 |
| scoringOpportunitiesPerMatch | 15.9 | 16 |
| earnedDangerToScoringOpportunityRate | 100% | 84.8% |
| highQualityDangerToOpportunityRate | 88.8% | 93.8% |
| mediumQualityDangerToOpportunityRate | 0% | 0% |
| lowQualityDangerToOpportunityRate | 0% | 0% |
| halfChanceRate | 3.4% | 19.3% |
| forcedDefensiveActionRate | 0.9% | 4.3% |
| territorialGainRate | 6% | 7.1% |
| severeBlowoutRate | 0% | 0% |

## Earned Danger Outcome Distribution Audit
- earnedDangerWindowCount: 105
- borderlineDangerWindowCount: 35
- scoringOpportunityOutcomeCount: 91
- halfChanceOutcomeCount: 27
- forcedDefensiveActionOutcomeCount: 6
- territorialGainOutcomeCount: 10
- momentumGainOutcomeCount: 0
- safePossessionOutcomeCount: 0
- neutralOutcomeCount: 6

## Danger Quality Distribution
| quality | count |
| --- | ---: |
| HIGH_QUALITY_DANGER | 97 |
| MEDIUM_QUALITY_DANGER | 36 |
| LOW_QUALITY_DANGER | 7 |
| NONE | 0 |

## Danger Outcome Distribution
| outcome | count |
| --- | ---: |
| SCORING_OPPORTUNITY | 91 |
| HALF_CHANCE | 27 |
| TERRITORIAL_GAIN | 10 |
| FORCED_DEFENSIVE_ACTION | 6 |
| NEUTRAL_PHASE | 6 |
| NONE | 0 |

## Danger-To-Opportunity Metrics
- earnedDangerToScoringOpportunityRateAfter: 84.8%
- borderlineDangerToScoringOpportunityRateAfter: 5.7%
- continuationToScoringOpportunityRateAfter: 0.3%

## Non-Scoring Layers
- halfChanceRateAfter: 19.3%
- forcedDefensiveActionRateAfter: 4.3%
- territorialGainRateAfter: 7.1%
- momentumGainRateAfter: 0%
- safePossessionOutcomeCountAfter: 0
- neutralOutcomeCountAfter: 6

## Longitudinal Route Economy Validation
- longitudinalWindowCount: 3
- longitudinalStableWindows: 3
- routeEconomyVariance: 0.6
- scoreEconomyVariance: 3.9
- earnedDangerOutcomeVariance: 5.5
- routeFamilyMixVariance: 0
| window | matches | avg points | events/match | opps/match | earned->opp | high->opp | half chance | territorial | severe blowout |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| window-1 | 17 | 20.5 | 6.8 | 15.8 | 87.1% | 96.4% | 15.4% | 2.6% | 0% |
| window-2 | 17 | 22.6 | 7.2 | 16.4 | 86.1% | 94.1% | 20.4% | 8.2% | 0% |
| window-3 | 16 | 24.4 | 7.9 | 15.8 | 81.6% | 91.4% | 21.2% | 9.6% | 0% |

## Volume Preservation Metrics
- densityCalibrationPreserved: true
- averageTotalPointsAfter: 22.4
- scoringEventsPerMatchAfter: 7.3
- scoringOpportunitiesPerMatchAfter: 16
- severeBlowoutRateAfter: 0%

## Gate Preservation Metrics
- gateSelectivityPreserved: true
- earnedDangerPreserved: true
- automaticDangerStillBlocked: true

## Post-Score And Goalkeeper Preservation
- postScoreResetPreserved: true
- goalkeeperSecureResetPreserved: true
- goalkeeperSecureToDangerAgainstRateAfter: 3.3%
- goalkeeperSecureToSafePossessionRateAfter: 100%

## Team Balance Metrics
- opportunityBalanceIndexAfter: 80
- scoringBalanceIndexAfter: 86
- pointBalanceIndexAfter: 87
- dominantTeamOpportunityChainMaxAfter: 14

## Route Family Mix By Team
| team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 387 | 32 | 28 | 32 | 323 |
| away | 191 | 48 | 34 | 48 | 288 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 12-2 | 5 |
| 12-14 | 3 |
| 14-14 | 3 |
| 14-15 | 3 |
| 15-14 | 3 |
| 12-9 | 2 |
| 14-12 | 2 |
| 19-2 | 2 |
| 2-12 | 2 |
| 22-7 | 2 |
| 0-11 | 1 |
| 11-7 | 1 |
| 12-0 | 1 |
| 12-4 | 1 |
| 12-7 | 1 |
| 14-7 | 1 |
| 15-16 | 1 |
| 15-2 | 1 |
| 16-7 | 1 |
| 16-9 | 1 |
| 17-14 | 1 |
| 17-2 | 1 |
| 17-7 | 1 |
| 19-0 | 1 |
| 19-7 | 1 |
| 2-15 | 1 |
| 2-16 | 1 |
| 21-22 | 1 |
| 4-9 | 1 |
| 7-14 | 1 |
| 7-17 | 1 |
| 9-19 | 1 |
| 9-9 | 1 |

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
- EARNED_DANGER_OUTCOME_DISTRIBUTION_RECHECK_COMPLETE
- EARNED_DANGER_TO_OPPORTUNITY_REDUCED
- DANGER_QUALITY_DISTRIBUTION_IMPROVED
- MEDIUM_QUALITY_DANGER_REINTRODUCED
- LOW_QUALITY_DANGER_REINTRODUCED
- HALF_CHANCE_LAYER_EXPANDED
- FORCED_DEFENSIVE_ACTION_LAYER_EXPANDED
- TERRITORIAL_GAIN_LAYER_EXPANDED
- LONGITUDINAL_ROUTE_ECONOMY_STABLE
- GATE_SELECTIVITY_PRESERVED
- EARNED_DANGER_PRESERVED
- AUTOMATIC_DANGER_STILL_BLOCKED
- VOLUME_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- TEAM_BALANCE_PRESERVED
- DOMINANCE_CHAIN_REGRESSED
- FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Recommendation
- recommendation: MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION
- nextSprintRecommendation: Sprint 6S - Earned Danger Outcome Tuning Review
