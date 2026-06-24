# Full-Match Late Game Threat Quality & Trailing Conversion 6V

## Summary
- status: PASS
- scope: FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION
- version: LATE_GAME_THREAT_QUALITY_6V
- baselineVersion: TRAILING_TEAM_RESPONSE_6U
- calibrationVersion: LATE_GAME_THREAT_QUALITY_6V
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 35
- recommendation: KEEP_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION_CALIBRATION
- nextSprintRecommendation: Sprint 6W - Late Game Threat Quality Monitoring

## Baseline 6U vs 6V
| Metric | Baseline 6U | After 6V |
| --- | ---: | ---: |
| averageTotalPoints | 21.8 | 22.8 |
| scoringEventsPerMatch | 7.1 | 7.4 |
| scoringOpportunitiesPerMatch | 16.3 | 16.5 |
| closeGameRate | 42% | 56% |
| competitiveGameRate | 82% | 76% |
| blowoutRate | 8% | 8% |
| severeBlowoutRate | 0% | 0% |
| trailingTeamResponseRate | 50.6% | 54.5% |
| trailingTeamScoringShare | 0% | 36% |
| trailingTeamTerritorialGainRate | 0% | 2% |
| trailingTeamForcedDefensiveActionRate | 0% | 2% |
| trailingTeamHalfChanceRate | 5.5% | 2.5% |
| trailingTeamEarnedDangerRate | 3.8% | 12.7% |
| trailingTeamLateGamePressureRate | 14.3% | 100% |

## Trailing Threat Quality Audit
- trailingThreatWindowCount: 354
- trailingThreatCount: 186
- trailingThreatQualityRate: 52.5%
- trailingSafePossessionToThreatRate: 0%
- trailingPressureReliefToThreatRate: 0%
- trailingThreatConversionRate: 63.4%

### Threat Quality Distribution
| Quality | Count |
| --- | ---: |
| NATURAL_SCORING_EVENT | 118 |
| SCORING_OPPORTUNITY | 38 |
| HALF_CHANCE | 9 |
| EARNED_DANGER | 7 |
| FORCED_DEFENSIVE_ACTION | 7 |
| TERRITORIAL_GAIN | 7 |

### Threat Cause Distribution
| Cause | Count |
| --- | ---: |
| NATURAL_CONVERSION | 118 |
| ROUTE_QUALITY_EDGE | 112 |
| SAFE_POSSESSION_TO_THREAT | 88 |
| TACTICAL_EDGE | 88 |
| LATE_GAME_PRESSURE | 24 |

## Natural Trailing Conversion Audit
- naturalTrailingScoringWindowCount: 106
- naturalTrailingScoringEventCount: 133
- naturalTrailingScoringShare: 36%
- injectedTrailingScoringEventCount: 0
- forcedTrailingScoreChangeCount: 0
- forcedComebackSuspicionCount: 171

## Late Game Threat Quality Audit
- lateGameWindowCount: 973
- lateGamePressureCount: 58
- lateGameThreatCount: 58
- lateGameThreatQualityRate: 100%
- trailingLateGameThreatCount: 58

### Late Game Threat Causes
| Cause | Count |
| --- | ---: |
| LATE_GAME_PRESSURE | 58 |
| ROUTE_QUALITY_EDGE | 58 |
| TACTICAL_EDGE | 50 |

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
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- routeFamilyDiversityPreserved: true
- gateSelectivityPreserved: true
- automaticDangerStillBlocked: true
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Warnings
- FULL_MATCH_BATCH_ECONOMY_HEALTHY
- LATE_GAME_THREAT_QUALITY_FOLLOWUP_COMPLETE
- TRAILING_THREAT_QUALITY_MEASURED
- NATURAL_TRAILING_CONVERSION_MEASURED
- LATE_GAME_THREAT_QUALITY_MEASURED
- TRAILING_THREAT_QUALITY_IMPROVED
- TRAILING_TERRITORIAL_GAIN_RESTORED
- TRAILING_FORCED_DEFENSIVE_ACTION_RESTORED
- TRAILING_EARNED_DANGER_IMPROVED
- TRAILING_SCORING_SHARE_RESTORED_NATURALLY
- LATE_GAME_THREAT_QUALITY_IMPROVED
- CLOSE_GAME_RATE_RECOVERED
- COMPETITIVE_GAME_RATE_PRESERVED
- BLOWOUT_RATE_PRESERVED
- SEVERE_BLOWOUT_STILL_LOW
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- GATE_SELECTIVITY_PRESERVED
- CALIBRATION_COVERAGE_COMPLETE
- NO_RUBBER_BANDING_CONFIRMED
- NO_FORCED_COMEBACK_CONFIRMED
- NO_TRAILING_SCORE_INJECTION_CONFIRMED
- NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED
- NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED