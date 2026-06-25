# Full-Match Match Economy Final Stabilization 6X

## Summary
- status: PASS
- scope: FULL_MATCH_ECONOMY_FINAL_STABILIZATION
- version: MATCH_ECONOMY_FINAL_STABILIZATION_6X
- baselineVersion: LATE_GAME_THREAT_MONITORING_6W
- stabilizationVersion: MATCH_ECONOMY_FINAL_STABILIZATION_6X
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 34
- finalStabilizationReady: true
- productBaselineReady: true
- routeFamilyDiversityPreserved: true
- routeFamilyMixPreserved: true
- noRollbackToShotOnly: true
- lateGameThreatQualityRateCorrected: 100
- recommendation: KEEP_MATCH_ECONOMY_FINAL_STABILIZATION
- nextSprintRecommendation: 7A - Product Baseline & Coach-Facing Match Report Readiness

## Baseline 6W vs Final 6X
| Metric | Baseline 6W | Final 6X |
| --- | --- | --- |
| averageTotalPoints | 22.2 | 22.2 |
| scoringEventsPerMatch | 7.2 | 7.2 |
| scoringOpportunitiesPerMatch | 16.3 | 16.3 |
| closeGameRate | 50% | 50% |
| competitiveGameRate | 78% | 78% |
| blowoutRate | 14% | 14% |
| severeBlowoutRate | 0% | 0% |
| lateGameThreatQualityRate | 100% | 100% |

## Metric Consistency
- lateGameThreatQualityMetricDefinition: lateGameThreatQualityRate = lateGameThreatCount / lateGamePressureCount after both values are restricted to late-game pressure-window events; lateGameThreatQualityRatio exposes the same population as a decimal ratio.
- lateGameThreatQualityRatio: 1
- lateGameThreatRateConsistency: true
| Metric | Value | Denominator | Status |
| --- | --- | --- | --- |
| closeGameRate | 50 | matchCount | PASS |
| competitiveGameRate | 78 | matchCount | PASS |
| blowoutRate | 14 | matchCount | PASS |
| severeBlowoutRate | 0 | matchCount | PASS |
| trailingTeamResponseRate | 54.8 | trailing windows | PASS |
| trailingTeamScoringShare | 35.3 | scoring events | PASS |
| trailingThreatQualityRate | 53.6 | trailing threat windows | PASS |
| trailingThreatConversionRate | 63.2 | trailing threat windows | PASS |
| lateGameThreatQualityRate | 100 | lateGamePressureCount | PASS |
| lateGameAutomaticThreatRate | 0 | lateGameThreatCount | PASS |
| lateGameThreatWithoutSignalRate | 0 | lateGameThreatCount | PASS |
| lateGameThreatFromRealSignalRate | 100 | lateGameThreatCount | PASS |
| forcedComebackSuspicionRate | 6 | timeline events | PASS |

## Economy Final Audit
| Check | Status |
| --- | --- |
| scoringVolumeStable | true |
| scoringOpportunityVolumeStable | true |
| closeGameDistributionStable | true |
| competitiveGameDistributionStable | true |
| blowoutControlled | true |
| severeBlowoutControlled | true |
| routeFamilyDiversityStable | true |
| lateGameThreatNatural | true |
| finalEconomyReadiness | true |

## Guardrails Final Audit
| Guardrail | Status |
| --- | --- |
| scoreFromScoreChangeAllRuns | true |
| officialPathConnectedAllRuns | true |
| scoringConstantsUnchanged | true |
| MatchBonusEventUnchanged | true |
| noScoreCap | true |
| noRewrite | true |
| noDeletion | true |
| noForcedScore | true |
| noForcedTrailingScore | true |
| noRubberBanding | true |
| noForcedComeback | true |
| noTrailingOpportunityForcing | true |
| noTrailingScoreChangeInjection | true |
| noUNKNOWN | true |
| noPENALTY | true |

## Longitudinal Stability
- windowCount: 3
- matchCountLimitExplicit: true
| Window | Matches | Avg points | Events/match | Opps/match | Close | Competitive | Blowout | Auto threat | Guardrails |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| window-1 | 17 | 22.7 | 7.4 | 16.3 | 58.8% | 88.2% | 5.9% | 0% | PASS |
| window-2 | 17 | 21.3 | 6.9 | 16.3 | 41.2% | 52.9% | 29.4% | 0% | PASS |
| window-3 | 16 | 22.6 | 7.3 | 16.4 | 50% | 93.8% | 6.3% | 0% | PASS |

## Route Family Mix
| Route family | Count | Point share |
| --- | --- | --- |
| SHOT_GOAL | 602 | 73% |
| TRY_TOUCHDOWN | 79 | 16% |
| CONVERSION_GOAL | 79 | 6.4% |
| DROP_GOAL | 57 | 4.6% |
| CONTINUATION | 595 | 0% |

## Close / Competitive / Blowout Distribution
| Metric | Value |
| --- | --- |
| closeGameRate | 50% |
| competitiveGameRate | 78% |
| oneScoreGameRate | 42% |
| twoScoreGameRate | 70% |
| blowoutRate | 14% |
| severeBlowoutRate | 0% |
| drawRate | 8% |
| scorelineDiversity | 68% |

## Trailing Response / Threat
| Metric | Value |
| --- | --- |
| trailingTeamResponseRate | 54.8% |
| trailingTeamOpportunityShare | 4.4% |
| trailingTeamScoringShare | 35.3% |
| trailingThreatQualityRate | 53.6% |
| trailingThreatConversionRate | 63.2% |
| trailingTeamTerritorialGainRate | 3.8% |
| trailingTeamForcedDefensiveActionRate | 4.1% |
| trailingTeamHalfChanceRate | 1.4% |
| trailingTeamEarnedDangerRate | 10.4% |

## Late Game Automaticity
| Metric | Value |
| --- | --- |
| lateGamePressureCount | 51 |
| lateGameThreatCount | 51 |
| lateGameThreatQualityRate | 100% |
| lateGameThreatQualityRatio | 1 |
| lateGameAutomaticThreatRate | 0% |
| lateGameThreatWithoutSignalRate | 0% |
| lateGameThreatFromRealSignalRate | 100% |
| lateGameThreatDeniedCount | 0 |
| lateGameThreatDowngradedCount | 0 |

## Forced Comeback Suspicion
| Metric | Value |
| --- | --- |
| forcedComebackSuspicionCount | 230 |
| forcedComebackSuspicionExplainedCount | 230 |
| forcedComebackSuspicionUnexplainedCount | 0 |
| actualForcedComebackDetectedCount | 0 |
| forcedComebackSuspicionRate | 6% |

## Natural Trailing Conversion Path
| Metric | Value |
| --- | --- |
| naturalTrailingScoringEventCount | 127 |
| trailingScoringPathCompleteCount | 127 |
| trailingScoringPathIncompleteCount | 0 |
| trailingScoringPathUnsupportedCount | 0 |
| injectedTrailingScoringEventCount | 0 |
| forcedTrailingScoreChangeCount | 0 |

## Guardrail Booleans
- scoringConstantsChanged: false
- scoreCapApplied: false
- postHocRewriteApplied: false
- scoringEventsDeleted: false
- forcedOpponentScoreApplied: false
- forcedTrailingTeamScoreApplied: false
- rubberBandingApplied: false
- comebackForced: false
- actualForcedComebackDetected: false
- leadingTeamScoreSuppressed: false
- trailingTeamOpportunityForced: false
- trailingTeamScoreChangeInjected: false
- trailingTeamScoringEventInjected: false
- MatchBonusEventChanged: false
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Warnings
- FINAL_METRIC_CONSISTENCY_AUDIT_COMPLETE
- LATE_GAME_THREAT_RATE_CORRECTED
- RATE_METRIC_RENAMED_AS_RATIO
- FINAL_SCORE_ECONOMY_HEALTHY
- FINAL_CLOSE_GAME_DISTRIBUTION_HEALTHY
- FINAL_COMPETITIVE_DISTRIBUTION_HEALTHY
- FINAL_BLOWOUT_RATE_CONTROLLED
- FINAL_SEVERE_BLOWOUT_RATE_CONTROLLED
- FINAL_ROUTE_FAMILY_DIVERSITY_PRESERVED
- FINAL_TRAILING_RESPONSE_HEALTHY
- FINAL_TRAILING_THREAT_QUALITY_HEALTHY
- FINAL_LATE_GAME_AUTOMATICITY_LOW
- FINAL_FORCED_COMEBACK_SUSPICION_EXPLAINED
- FINAL_NATURAL_TRAILING_CONVERSION_PATH_COMPLETE
- FINAL_CALIBRATION_COVERAGE_COMPLETE
- FINAL_GUARDRAIL_AUDIT_COMPLETE
- NO_SCORE_MANIPULATION_CONFIRMED
- NO_RUBBER_BANDING_CONFIRMED
- NO_FORCED_COMEBACK_CONFIRMED
- NO_TRAILING_SCORE_INJECTION_CONFIRMED
- NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED
- FINAL_LONGITUDINAL_STABILITY_AUDIT_COMPLETE
- MATCH_ECONOMY_FINAL_STABILIZATION_COMPLETE
- PRODUCT_BASELINE_READY
- FULL_MATCH_BATCH_ECONOMY_HEALTHY