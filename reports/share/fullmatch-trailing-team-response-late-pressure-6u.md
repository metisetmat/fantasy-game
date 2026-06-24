# Full-Match Trailing Team Response & Late Game Pressure 6U

## Summary
- status: PARTIAL
- scope: FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE
- version: TRAILING_TEAM_RESPONSE_6U
- baselineVersion: CLOSE_GAME_DISTRIBUTION_6T
- calibrationVersion: TRAILING_TEAM_RESPONSE_6U
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 36
- recommendation: KEEP_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE_CALIBRATION
- nextSprintRecommendation: Sprint 6V - Late Game Pressure Follow-up

## Baseline 6T vs 6U
| Metric | Baseline 6T | After 6U |
| --- | ---: | ---: |
| averageTotalPoints | 21 | 21.8 |
| medianTotalPoints | 22.5 | 22 |
| scoringEventsPerMatch | 6.8 | 7.1 |
| scoringOpportunitiesPerMatch | 15.4 | 16.3 |
| scoringOpportunitiesPerSegment | 1.9 | 2 |
| averageScoreDifference | 7.9 | 7.9 |
| medianScoreDifference | 7 | 8.5 |
| maxScoreDifference | 22 | 18 |
| closeGameRate | 54% | 42% |
| competitiveGameRate | 80% | 82% |
| oneScoreGameRate | 36% | 36% |
| twoScoreGameRate | 72% | 70% |
| blowoutRate | 14% | 8% |
| severeBlowoutRate | 0% | 0% |
| trailingTeamResponseRate | 8% | 50.6% |
| trailingTeamOpportunityShare | 8% | 21.4% |
| trailingTeamScoringShare | 1.2% | 0% |
| trailingTeamRecoveryShare | 0% | 9% |
| trailingTeamPressureReliefRate | 0% | 46% |
| trailingTeamLateGamePressureRate | 0% | 14.3% |
| trailingTeamRiskIncreaseRate | 0% | 9.2% |
| leadingTeamRepeatOpportunityRate | 44% | 54% |
| leadingTeamReattackRate | 0% | 0% |
| leadingTeamRunawayRate | 0% | 0% |

## Trailing Team Response Audit
- trailingTeamResponseWindowCount: 346
- trailingTeamResponseCount: 175
- trailingTeamNoResponseCount: 171
- trailingTeamResponseRate: 50.6%
- trailingTeamEarnedDangerRate: 3.8%
- trailingTeamHalfChanceRate: 5.5%
- trailingTeamTerritorialGainRate: 0%
- trailingTeamForcedDefensiveActionRate: 0%
- trailingTeamFatigueEdgeUseRate: 0%
- trailingTeamTacticalEdgeUseRate: 9.2%

### Response Causes
| Cause | Count |
| --- | ---: |
| SAFE_POSSESSION_STABILIZED | 162 |
| ROUTE_QUALITY_EDGE | 32 |
| TACTICAL_RISK_INCREASE | 32 |
| HALF_CHANCE_CREATED | 19 |
| DEFENSIVE_RECOVERY | 13 |
| LATE_GAME_PRESSURE | 1 |

### Possession Quality
| Quality | Count |
| --- | ---: |
| PRESSURE_RELIEF | 143 |
| HALF_CHANCE | 19 |
| EARNED_DANGER | 13 |

### Route Quality
| Quality | Count |
| --- | ---: |
| POSSESSION_ROUTE | 143 |
| classifier_6r | 32 |

## Late Game Pressure Audit
- lateGameWindowCount: 50
- lateGameCloseWindowCount: 19
- finalQuarterCompetitiveWindowCount: 39
- trailingTeamLateGamePossessionCount: 343
- trailingTeamLateGamePressureCount: 49
- lateGamePressureRate: 14.3%

### Late Game Pressure Causes
| Cause | Count |
| --- | ---: |
| LATE_GAME_PRESSURE | 49 |

## Longitudinal Trailing Response
| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Trailing response | Trail opp share | Trail score share | Late pressure | Chain max | Coverage | Diversity | Guardrails |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| window-1 | 17 | 21.1 | 6.9 | 16.7 | 7.5 | 47.1% | 88.2% | 5.9% | 0% | 53% | 21.8% | 0% | 14.8% | 4 | COMPLETE | true | PASS |
| window-2 | 17 | 22.4 | 7.2 | 15.9 | 8.5 | 35.3% | 76.5% | 5.9% | 0% | 49.6% | 21.2% | 0% | 13.8% | 4 | COMPLETE | true | PASS |
| window-3 | 16 | 22 | 7.2 | 16.3 | 7.6 | 43.8% | 81.3% | 12.5% | 0% | 49.1% | 21.3% | 0% | 14.3% | 4 | COMPLETE | true | PASS |

## Route Family Mix
- routeFamilyDiversityPreserved: true
- noRollbackToShotOnly: true
| Team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 402 | 30 | 23 | 30 | 325 |
| away | 205 | 41 | 42 | 41 | 279 |

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
- trailingTeamOpportunityForced: false
- trailingTeamScoreChangeInjected: false
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
- TRAILING_TEAM_RESPONSE_FOLLOWUP_COMPLETE
- TRAILING_TEAM_RESPONSE_MEASURED
- LATE_GAME_PRESSURE_MEASURED
- NO_RUBBER_BANDING_CONFIRMED
- NO_FORCED_COMEBACK_CONFIRMED
- NO_TRAILING_SCORE_INJECTION_CONFIRMED
- NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED
- TRAILING_TEAM_RESPONSE_RESTORED
- TRAILING_TEAM_RESPONSE_HEALTHY
- TRAILING_TEAM_RESPONSE_CAUSES_MEASURED
- LATE_GAME_PRESSURE_HEALTHY
- CLOSE_GAME_RATE_REGRESSED
- COMPETITIVE_GAME_RATE_PRESERVED
- BLOWOUT_RATE_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- FINAL_QUARTER_COMPETITION_PRESERVED
- GATE_SELECTIVITY_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- CALIBRATION_COVERAGE_COMPLETE
- FULL_MATCH_BATCH_ECONOMY_PARTIAL