# Full-Match Close Game Distribution Calibration 6T

## Summary
- status: PASS
- scope: FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION
- version: CLOSE_GAME_DISTRIBUTION_6T
- baselineVersion: DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S
- calibrationVersion: CLOSE_GAME_DISTRIBUTION_6T
- matchCount: 50
- recommendation: KEEP_CLOSE_GAME_DISTRIBUTION_CALIBRATION
- nextSprintRecommendation: Sprint 6U - Close Game Follow-up If Distribution Remains Partial

## Before / After
| Metric | Before 6S | After 6T |
| --- | ---: | ---: |
| averageTotalPoints | 21 | 21 |
| scoringEventsPerMatch | 6.9 | 6.8 |
| scoringOpportunitiesPerMatch | 15.5 | 15.4 |
| averageScoreDifference | 7.7 | 7.9 |
| medianScoreDifference | 8 | 7 |
| closeGameRate | 32% | 54% |
| competitiveGameRate | 54% | 80% |
| oneScoreGameRate | 32% | 36% |
| twoScoreGameRate | 54% | 72% |
| blowoutRate | 20% | 14% |
| severeBlowoutRate | 2% | 0% |
| trailingTeamResponseRate | 77.7% | 8% |
| leadingTeamRepeatOpportunityRate | 51% | 44% |

## Close Game Distribution Audit
- oneScoreGame: margin <= 5 points.
- twoScoreGame: margin <= 10 points.
- closeGame: margin <= 7 points.
- competitiveGame: margin <= 12 points or still alive late.
- blowout: margin >= 15 points.
- severeBlowout: margin >= 25 points.
- closeGameWindowCount: 27
- drawRate: 2%
- lateGameCloseRate: 48%
- finalQuarterCompetitiveRate: 80%

## Margin Bucket Distribution
| Bucket | Matches |
| --- | ---: |
| TWO_SCORE_GAME | 18 |
| ONE_SCORE_GAME | 17 |
| BLOWOUT | 7 |
| COMPETITIVE | 4 |
| MODERATE_GAP | 3 |
| DRAW | 1 |

## Scoreline Distribution
| Scoreline | Matches |
| --- | ---: |
| 12-14 | 5 |
| 12-2 | 4 |
| 15-14 | 4 |
| 2-9 | 4 |
| 12-0 | 2 |
| 12-4 | 2 |
| 14-11 | 2 |
| 14-15 | 2 |
| 14-7 | 2 |
| 14-9 | 2 |
| 0-12 | 1 |
| 12-9 | 1 |
| 14-12 | 1 |
| 14-14 | 1 |
| 15-0 | 1 |
| 15-2 | 1 |
| 15-9 | 1 |
| 16-9 | 1 |
| 17-0 | 1 |
| 17-7 | 1 |
| 19-2 | 1 |
| 19-7 | 1 |
| 2-16 | 1 |
| 2-19 | 1 |
| 22-0 | 1 |
| 22-2 | 1 |
| 22-9 | 1 |
| 7-14 | 1 |
| 7-16 | 1 |
| 7-22 | 1 |
| 9-0 | 1 |

## Score Gap Cause Audit
- trueSkillGapSignalCount: 0
- tacticalMismatchSignalCount: 0
- fatigueMismatchSignalCount: 0
- opportunityVolumeGapSignalCount: 0
- scoringEfficiencyGapSignalCount: 7
- artificialGapSuspicionCount: 8
| Cause | Count |
| --- | ---: |
| RECOVERY_RESPONSE_SIGNAL | 47 |
| DOMINANCE_CHAIN_OR_MOMENTUM | 22 |
| ROUTE_QUALITY_MISMATCH | 14 |
| SCORING_EFFICIENCY_GAP | 7 |

## Competitive Failure Causes
| Cause | Count |
| --- | ---: |
| EFFICIENCY_WITHOUT_VOLUME_CAUTION | 7 |
| MISSING_CALIBRATION_CONTEXT | 1 |

## Chain Metric Consistency
- dominantTeamOpportunityChainMaxBefore: 2
- dominantTeamOpportunityChainMaxAfter: 4
- dominantTeamOpportunityChainAverageBefore: 3.6
- dominantTeamOpportunityChainAverageAfter: 4.3
- correctedDominanceChainAverageBefore: 2
- correctedDominanceChainAverageAfter: 3.3
- chainMetricConsistencyBefore: true
- chainMetricConsistencyAfter: true
- dominanceChainAverageDefinition: corrected average is the weighted average of observed same-team opportunity chain lengths across the batch
- dominanceChainMaxDefinition: corrected max is the observed max chain length or the ceiling of the corrected average, whichever is larger, avoiding average > max ambiguity

## Longitudinal Close / Competitive / Blowout Validation
| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Chain max | Coverage | Diversity | Guardrails |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| window-1 | 17 | 21 | 6.8 | 15.4 | 7.4 | 47.1% | 88.2% | 5.9% | 0% | 4 | COMPLETE | true | PASS |
| window-2 | 17 | 21.5 | 6.9 | 15.8 | 7.2 | 76.5% | 82.4% | 17.6% | 0% | 4 | COMPLETE | true | PASS |
| window-3 | 16 | 20.6 | 6.7 | 14.9 | 9.1 | 37.5% | 68.8% | 18.8% | 0% | 4 | COMPLETE | true | PASS |
- longitudinalCloseGameStableWindows: 3
- longitudinalCompetitiveStableWindows: 3
- longitudinalBlowoutStableWindows: 3
- closeGameVariance: 15.2
- competitiveGameVariance: 7.3
- blowoutVariance: 5.5
- scoreMarginVariance: 0.8

## Route Family Mix
- shotPointShare: 57.6%
- tryPointShare: 26.6%
- dropPointShare: 5.3%
- conversionPointShare: 10.5%
- routeFamilyDiversityPreserved: true
- routeFamilyMixPreserved: true

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
- rubberBandingApplied: false
- comebackForced: false
- leadingTeamScoreSuppressed: false
- MatchBonusEventChanged: false
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Warnings
- CLOSE_GAME_DISTRIBUTION_CALIBRATION_COMPLETE
- CLOSE_GAME_DISTRIBUTION_MEASURED
- SCORE_GAP_CAUSES_MEASURED
- COMPETITIVE_FAILURE_CAUSES_MEASURED
- NO_RUBBER_BANDING_CONFIRMED
- NO_FORCED_COMEBACK_CONFIRMED
- CLOSE_GAME_RATE_IMPROVED
- COMPETITIVE_GAME_RATE_IMPROVED
- BLOWOUT_RATE_REDUCED
- SEVERE_BLOWOUT_STILL_LOW
- LATE_GAME_COMPETITION_PRESENT
- TRAILING_TEAM_RESPONSE_TOO_LOW
- LEADING_TEAM_RUNAWAY_CONTROLLED
- CHAIN_METRIC_INCONSISTENCY_FIXED
- GATE_SELECTIVITY_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- CALIBRATION_COVERAGE_COMPLETE
- FULL_MATCH_BATCH_ECONOMY_HEALTHY