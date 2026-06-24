# Full-Match Late Game Threat Quality Monitoring 6W

## Summary
- status: PASS
- scope: FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING
- version: LATE_GAME_THREAT_MONITORING_6W
- baselineVersion: LATE_GAME_THREAT_QUALITY_6V
- calibrationVersion: LATE_GAME_THREAT_MONITORING_6W
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 34
- recommendation: KEEP_LATE_GAME_THREAT_QUALITY_MONITORING
- nextSprintRecommendation: Sprint 6X - Match Economy Final Stabilization

## Baseline 6V vs Monitoring 6W
| Metric | Baseline 6V | After 6W |
| --- | ---: | ---: |
| averageTotalPoints | 22.8 | 22.2 |
| scoringEventsPerMatch | 7.4 | 7.2 |
| scoringOpportunitiesPerMatch | 16.5 | 16.3 |
| closeGameRate | 56% | 50% |
| competitiveGameRate | 76% | 78% |
| blowoutRate | 8% | 14% |
| severeBlowoutRate | 0% | 0% |
| trailingTeamScoringShare | 36% | 35.3% |
| trailingThreatQualityRate | 52.5% | 53.6% |
| trailingThreatConversionRate | 63.4% | 63.2% |
| lateGameThreatQualityRate | 100% | 107.8% |
| forcedComebackSuspicionCount | 171 | 230 |

## Late Game Threat Automaticity
- lateGamePressureCount: 51
- lateGameThreatCount: 55
- lateGameThreatQualityRate: 107.8%
- lateGameAutomaticThreatRate: 1.8%
- lateGameThreatWithoutSignalRate: 1.8%
- lateGameThreatFromRealSignalRate: 98.2%
- lateGameThreatDeniedCount: 0
- lateGameThreatDowngradedCount: 0

### Late Game Threat Causes
| Cause | Count |
| --- | ---: |
| ROUTE_QUALITY_EDGE | 51 |
| LATE_GAME_STATE_ONLY | 4 |

## Forced Comeback Suspicion
- forcedComebackSuspicionCount: 230
- forcedComebackSuspicionExplainedCount: 230
- forcedComebackSuspicionUnexplainedCount: 0
- forcedComebackSuspicionRate: 6%
- actualForcedComebackDetectedCount: 0

### Forced Comeback Suspicion Causes
| Cause | Count |
| --- | ---: |
| NATURAL_OFFICIAL_SCORE_CHANGE | 127 |
| FALSE_POSITIVE_GUARDRAIL_CLEAN | 103 |

## Natural Trailing Conversion Path
- naturalTrailingScoringEventCount: 127
- trailingScoringPathCompleteCount: 127
- trailingScoringPathIncompleteCount: 0
- trailingScoringPathUnsupportedCount: 0
- injectedTrailingScoringEventCount: 0
- forcedTrailingScoreChangeCount: 0

### Natural Conversion Evidence
| Evidence | Count |
| --- | ---: |
| OFFICIAL_ROUTE_TO_SCORE_CHANGE | 127 |

## Longitudinal Monitoring
| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Trail response | Threat quality | Trail score share | Late threat | Automatic threat | Suspicion rate | Unexplained | Path complete | Chain max | Coverage | Diversity | Guardrails |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| window-1 | 17 | 22.7 | 7.4 | 16.3 | 6.5 | 58.8% | 88.2% | 5.9% | 0% | 54.7% | 53.8% | 38.4% | 114.3% | 0% | 5.5% | 0 | 100% | 2 | COMPLETE | true | PASS |
| window-2 | 17 | 21.3 | 6.9 | 16.3 | 9.2 | 41.2% | 52.9% | 29.4% | 0% | 54.4% | 52.6% | 31.4% | 100% | 0% | 6.2% | 0 | 100% | 2 | COMPLETE | true | PASS |
| window-3 | 16 | 22.6 | 7.3 | 16.4 | 7.1 | 50% | 93.8% | 6.3% | 0% | 55.3% | 54.4% | 35.9% | 111.1% | 5% | 6.3% | 0 | 100% | 2 | COMPLETE | true | PASS |

## Route Family Mix
- routeFamilyDiversityPreserved: true
- noRollbackToShotOnly: true
| Team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 397 | 37 | 27 | 37 | 316 |
| away | 205 | 42 | 30 | 42 | 279 |

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
- forcedComebackDetected: false
- leadingTeamScoreSuppressed: false
- trailingTeamOpportunityForced: false
- trailingTeamScoreChangeInjected: false
- trailingTeamScoringEventInjected: false
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Warnings
- FULL_MATCH_BATCH_ECONOMY_HEALTHY
- LATE_GAME_THREAT_MONITORING_COMPLETE
- LATE_GAME_THREAT_AUTOMATICITY_MEASURED
- LATE_GAME_THREAT_AUTOMATICITY_REDUCED
- LATE_GAME_THREAT_AUTOMATICITY_EXPLAINED
- LATE_GAME_THREAT_FROM_REAL_SIGNAL_CONFIRMED
- FORCED_COMEBACK_SUSPICION_MEASURED
- FORCED_COMEBACK_SUSPICION_EXPLAINED
- FORCED_COMEBACK_FALSE_POSITIVES_CLASSIFIED
- NATURAL_TRAILING_CONVERSION_PATH_MEASURED
- NATURAL_TRAILING_CONVERSION_PATH_COMPLETE
- NO_ACTUAL_FORCED_COMEBACK_CONFIRMED
- NO_RUBBER_BANDING_CONFIRMED
- NO_FORCED_COMEBACK_CONFIRMED
- NO_TRAILING_SCORE_INJECTION_CONFIRMED
- NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED
- NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED
- CLOSE_GAME_RATE_PRESERVED
- COMPETITIVE_GAME_RATE_PRESERVED
- BLOWOUT_RATE_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- GATE_SELECTIVITY_PRESERVED
- CALIBRATION_COVERAGE_COMPLETE