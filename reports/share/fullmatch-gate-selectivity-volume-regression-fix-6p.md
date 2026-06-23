# Full-Match Gate Selectivity Volume Regression Fix 6P

## Status
- status: PASS
- scope: FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX
- version: GATE_SELECTIVITY_VOLUME_6P
- matchCount: 50
- baselineVersion: EARNED_DANGER_GATE_TUNING_6O
- calibrationVersion: GATE_SELECTIVITY_VOLUME_6P
- recommendation: KEEP_GATE_SELECTIVITY_VOLUME_FIX
- nextSprintRecommendation: Sprint 6Q - Route Economy Recheck After Selectivity Fix

## Baseline 6O Summary
- averageTotalPointsBefore: 39.5
- scoringEventsPerMatchBefore: 12.6
- scoringOpportunitiesPerMatchBefore: 28.1
- blowoutRateBefore: 50%
- severeBlowoutRateBefore: 28%
- resetToDangerRateBefore: 100%
- earnedDangerRateBefore: 99.8%
- borderlineDangerRateBefore: 0.2%

## After Calibration Summary
- averageTotalPointsAfter: 24.6
- scoringEventsPerMatchAfter: 7.9
- scoringOpportunitiesPerMatchAfter: 17.2
- blowoutRateAfter: 22%
- severeBlowoutRateAfter: 0%
- resetToDangerRateAfter: 21.6%
- earnedDangerRateAfter: 18.7%
- borderlineDangerRateAfter: 2.9%
- automaticDangerSuspicionRateAfter: 0%

## Before / After Table
| metric | before | after | movement |
| --- | ---: | ---: | --- |
| average total points | 39.5 | 24.6 | down |
| scoring events per match | 12.6 | 7.9 | down |
| scoring opportunities per match | 28.1 | 17.2 | down |
| reset to danger | 100% | 21.6% | down |
| earned danger | 99.8% | 18.7% | down |
| borderline danger | 0.2% | 2.9% | up |
| blowout rate | 50% | 22% | down |
| severe blowout rate | 28% | 0% | down |

## Gate Selectivity Audit Summary
- observedGateRowCount: 583
- allowedDangerWithNegativeContextCountBefore: 550
- allowedDangerWithNegativeContextCountAfter: 126
- allowedDangerWithOnlyNegativeContextCount: 0
- allowedDangerImmediateAfterResetCountAfter: 126
- allowedDangerLowSpacingCountAfter: 126
- allowedDangerLeadingTeamReattackCountAfter: 0
- gateTooLooseSuspicionCountAfter: 0
- gateTooStrictSuspicionCountAfter: 0

## Positive vs Negative Gate Reason Separation

### Positive Gate Reason Distribution
| positive reason | count |
| --- | ---: |
| ATTRIBUTE_EDGE | 583 |
| SUPPORT_EDGE | 583 |
| TACTICAL_EDGE | 583 |
| PRESSURE_EDGE | 535 |
| FATIGUE_EDGE | 398 |
| MISTAKE_EDGE | 267 |

### Negative Gate Context Distribution
| negative context | count |
| --- | ---: |
| IMMEDIATE_AFTER_RESET | 583 |
| LOW_SPACING | 583 |
| POST_SCORE_CONTEXT | 429 |
| NEUTRAL_REBUILD_REQUIRED | 307 |
| LEADING_TEAM_REATTACK | 282 |
| LOW_FATIGUE_EDGE | 185 |
| SAFE_POSSESSION_REQUIRED | 150 |

## Gate Decision Distribution
| decision | count |
| --- | ---: |
| DOWNGRADE_TO_NEUTRAL | 254 |
| DOWNGRADE_TO_SAFE_POSSESSION | 150 |
| ALLOW_DANGER | 109 |
| FORCE_REBUILD_PHASE | 53 |
| ALLOW_BORDERLINE_DANGER | 17 |

## Earned / Borderline / Automatic Classification
| classification | count |
| --- | ---: |
| DOWNGRADED_TO_NEUTRAL | 254 |
| DOWNGRADED_TO_SAFE_POSSESSION | 150 |
| EARNED | 109 |
| BLOCKED_BY_GATE | 53 |
| BORDERLINE | 17 |

## Volume Metrics
- scoringOpportunityToScoringEventRateAfter: 46%
- continuationSelectionRateAfter: 39.6%
- continuationToScoringOpportunityRateAfter: 60.4%
- earnedDangerToScoringOpportunityRateAfter: 100%
- borderlineDangerToScoringOpportunityRateAfter: 100%

## Dominance Chain Metrics
- dominantTeamOpportunityChainMaxAfter: 3
- sameTeamConsecutiveOpportunityRateAfter: 9.8%
- sameFamilyConsecutiveOpportunityRateAfter: 1.3%
- dominanceChainsPreservedOrImproved: true

## Post-Score Reset And Reset Specificity
- postScoreImmediateReattackRateAfter: 17.2%
- postScoreResetProtectedRateAfter: 76.8%
- concedingTeamFirstPossessionRateAfter: 70.1%
- postScoreResetPreserved: true
- resetSpecificityPreserved: true

## Goalkeeper Secure Preservation
- goalkeeperSecureBreaksDominanceRateAfter: 100%
- goalkeeperSecureToSafePossessionRateAfter: 100%
- goalkeeperSecureToDangerAgainstRateAfter: 68.3%
- goalkeeperSecureResetPreserved: true

## Team Balance And Route Diversity
- opportunityBalanceIndexAfter: 83
- scoringBalanceIndexAfter: 89
- pointBalanceIndexAfter: 90
- trailingTeamResponseRateAfter: 75.6%
- routeFamilyDiversityPreserved: true
- routeFamilyMixPreserved: true
- routeFamilyMixByTeam.home: {"SHOT_GOAL":396,"TRY_TOUCHDOWN":40,"CONVERSION_GOAL":39,"DROP_GOAL":27,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":311}
- routeFamilyMixByTeam.away: {"SHOT_GOAL":190,"TRY_TOUCHDOWN":61,"CONVERSION_GOAL":61,"DROP_GOAL":45,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":252}

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 12 - 14 | 3 |
| 12 - 2 | 3 |
| 14 - 12 | 2 |
| 14 - 15 | 2 |
| 14 - 9 | 2 |
| 17 - 21 | 2 |
| 2 - 15 | 2 |
| 11 - 2 | 1 |
| 12 - 19 | 1 |
| 12 - 4 | 1 |
| 12 - 7 | 1 |
| 12 - 9 | 1 |
| 14 - 0 | 1 |
| 14 - 14 | 1 |
| 14 - 16 | 1 |

## Route Family Mix Distribution
| route family mix | matches |
| --- | ---: |
| MULTI_FAMILY | 49 |
| SHOT_ONLY | 1 |

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
- RESET_TO_DANGER_RATE_REDUCED
- EARNED_DANGER_RATE_REDUCED_TO_HEALTHY_RANGE
- FULL_MATCH_BATCH_ECONOMY_PARTIAL
- AVERAGE_TOTAL_POINTS_REDUCED
- SCORING_EVENTS_REDUCED
- SCORING_OPPORTUNITY_VOLUME_REDUCED
- SEVERE_BLOWOUT_RATE_REDUCED
- BLOWOUT_RATE_REDUCED
- POST_SCORE_RESET_RESTORED
- RESET_SPECIFICITY_RESTORED
- DOMINANCE_CHAIN_RECALIBRATED
- NEGATIVE_CONTEXT_NO_LONGER_TREATED_AS_POSITIVE
- GATE_SELECTIVITY_RESTORED

## Recommendation
- recommendation: KEEP_GATE_SELECTIVITY_VOLUME_FIX
- nextSprintRecommendation: Sprint 6Q - Route Economy Recheck After Selectivity Fix
