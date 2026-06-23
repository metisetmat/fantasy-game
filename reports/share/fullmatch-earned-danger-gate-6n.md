# Full-Match Earned Danger Gate 6N

## Status
- status: PARTIAL
- scope: FULL_MATCH_EARNED_DANGER_GATE_CALIBRATION
- version: EARNED_DANGER_GATE_6N
- matchCount: 50
- baselineVersion: RESET_BREAK_BLOWOUT_ECONOMY_6M
- calibrationVersion: EARNED_DANGER_GATE_6N
- recommendation: IMPROVE_RESET_TO_DANGER_GATE
- nextSprintRecommendation: Sprint 6O - Earned Danger Gate Follow-up Without Score Adjustment

## Baseline 6M Summary
- blowoutRate: 46%
- averageScoreDifference: 11.1
- resetToImmediateDangerRate: 87.4%
- automaticDangerSuspicionRate: 93.2%
- earnedDangerRate: 6.8%
- goalkeeperSecureBreaksDominanceRate: 100%
- postScoreImmediateReattackRate: 15.9%
- postScoreResetProtectedRate: 78.5%
- concedingTeamFirstPossessionRate: 67.2%

## After Calibration Summary
- averageTotalPointsAfter: 30.6
- scoringEventsPerMatchAfter: 9.7
- scoringOpportunitiesPerMatchAfter: 20.5
- averageScoreDifferenceAfter: 11.6
- blowoutRateAfter: 42%
- closeGameRateAfter: 32%
- competitiveGameRateAfter: 64%
- resetToImmediateDangerRateAfter: 0%
- resetToDangerRateAfter: 0%
- automaticDangerSuspicionRateAfter: 0%
- earnedDangerRateAfter: 0%
- borderlineDangerRateAfter: 0%
- dangerBlockedByGateRateAfter: 2%
- dangerDowngradedToNeutralRateAfter: 12%
- dangerDowngradedToSafePossessionRateAfter: 86%

## Before / After Table
| metric | before | after | movement |
| --- | ---: | ---: | --- |
| average total points | 22.1 | 30.6 | up |
| scoring events per match | 7.2 | 9.7 | up |
| scoring opportunities per match | 16 | 20.5 | up |
| average score difference | 11.1 | 11.6 | up |
| median score difference | 11 | 10 | down |
| max score difference | 27 | 26 | down |
| blowout rate | 46% | 42% | down |
| severe blowout rate | 6% | 14% | up |
| close game rate | 28% | 32% | up |
| competitive game rate | 62% | 64% | up |
| reset to immediate danger | 87.4% | 0% | down |
| reset to danger | 100% | 0% | down |
| automatic danger suspicion | 93.2% | 0% | down |
| earned danger | 6.8% | 0% | down |
| borderline danger | 0% | 0% | flat |
| danger blocked by gate | 0% | 2% | up |
| danger downgraded to neutral | 0% | 12% | up |
| danger downgraded to safe possession | 0% | 86% | up |
| danger without support count | 50 | 0 | down |
| danger without tactical edge count | 50 | 0 | down |
| danger without attribute edge count | 49 | 0 | down |
| danger despite goalkeeper secure count | 45 | 0 | down |

## Blowout Root Cause Audit Summary
| root cause | matches |
| --- | ---: |
| DANGER_NOT_ATTRIBUTE_GATED_ENOUGH | 50 |
| DANGER_NOT_TACTICALLY_EARNED | 50 |
| RESET_TO_DANGER_TOO_FAST | 50 |
| WINNING_TEAM_POST_SCORE_REATTACK_TOO_HIGH | 43 |
| GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_FAST | 34 |
| WINNING_TEAM_POST_RESET_DANGER_TOO_HIGH | 29 |
| LOSING_TEAM_RESPONSE_TOO_WEAK | 4 |

## Reset-To-Danger Quality Audit Summary
| warning | count |
| --- | ---: |
| AUTOMATIC_RESET_TO_DANGER_SUSPECTED | 50 |
| RESET_TO_DANGER_DESPITE_LOW_FATIGUE_EDGE | 50 |
| RESET_TO_DANGER_WITHOUT_SUPPORT | 50 |
| RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE | 50 |
| RESET_TO_IMMEDIATE_DANGER | 50 |
| RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE | 49 |
| EARNED_RESET_TO_DANGER | 19 |
| RESET_TO_DANGER_WITHOUT_SPACING | 3 |

## Earned Danger Gate Audit Summary
- earnedDangerGateConnected: true
- earnedDangerGateEffective: true
- resetToDangerWithoutSupportCountAfter: 0
- resetToDangerWithoutTacticalEdgeCountAfter: 0
- resetToDangerWithoutAttributeEdgeCountAfter: 0
- resetToDangerDespiteGoalkeeperSecureCountAfter: 0
- goalkeeperSecureToDangerAgainstEarnedRateAfter: 0%
- goalkeeperSecureToDangerAgainstAutomaticSuspicionRateAfter: 0%
- goalkeeperSecureDangerDowngradedCountAfter: 11

## Gate Decision Distribution
| decision | count |
| --- | ---: |
| DOWNGRADE_TO_SAFE_POSSESSION | 43 |
| DOWNGRADE_TO_NEUTRAL | 6 |
| FORCE_REBUILD_PHASE | 1 |

## Earned Danger Classification Distribution
| classification | count |
| --- | ---: |
| DOWNGRADED_TO_SAFE_POSSESSION | 43 |
| DOWNGRADED_TO_NEUTRAL | 6 |
| BLOCKED_BY_GATE | 1 |

## Gate Reason Code Distribution
| reason code | count |
| --- | ---: |
| ATTRIBUTE_EDGE | 50 |
| IMMEDIATE_AFTER_RESET | 50 |
| LEADING_TEAM_REATTACK | 50 |
| LOW_SPACING | 50 |
| SUPPORT_EDGE | 50 |
| TACTICAL_EDGE | 50 |
| POST_SCORE_CONTEXT | 48 |
| SAFE_POSSESSION_REQUIRED | 43 |
| LOW_FATIGUE_EDGE | 32 |
| PRESSURE_EDGE | 21 |
| FATIGUE_EDGE | 18 |
| NEUTRAL_REBUILD_REQUIRED | 7 |
| MISTAKE_EDGE | 5 |

## Close / Competitive / Blowout Metrics
- closeGameRate: 32%
- competitiveGameRate: 64%
- blowoutRate: 42%
- severeBlowoutRate: 14%
- shutoutRate: 6%
- oneSidedScoringRate: 6%

## Preservation Checks
- densityCalibrationPreserved: true
- routeFamilyMixPreserved: true
- teamOpportunityBalancePreserved: true
- dominanceChainsPreservedOrImproved: false
- goalkeeperSecureResetPreserved: true
- postScoreResetPreserved: false
- resetSpecificityPreserved: false
- earnedDangerGateConnected: true
- earnedDangerGateEffective: true
- blowoutEconomyImproved: true

## Route Family Mix By Team
- home: {"SHOT_GOAL":393,"TRY_TOUCHDOWN":78,"CONVERSION_GOAL":78,"DROP_GOAL":55,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":223}
- away: {"SHOT_GOAL":196,"TRY_TOUCHDOWN":81,"CONVERSION_GOAL":79,"DROP_GOAL":65,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":207}

## Route Family Mix Distribution
| route family mix | matches |
| --- | ---: |
| MULTI_FAMILY | 50 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 12 - 2 | 2 |
| 19 - 21 | 2 |
| 19 - 9 | 2 |
| 22 - 9 | 2 |
| 26 - 4 | 2 |
| 7 - 16 | 2 |
| 11 - 0 | 1 |
| 12 - 16 | 1 |
| 12 - 19 | 1 |
| 12 - 21 | 1 |
| 12 - 7 | 1 |
| 12 - 9 | 1 |

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
- EARNED_DANGER_GATE_CALIBRATED
- EARNED_DANGER_GATE_CONNECTED
- BLOWOUT_RATE_REDUCED
- RESET_TO_IMMEDIATE_DANGER_REDUCED
- AUTOMATIC_DANGER_REDUCED
- EARNED_DANGER_STILL_TOO_LOW
- GOALKEEPER_SECURE_RESET_GAINS_PRESERVED
- POST_SCORE_RESET_REGRESSED
- DOMINANCE_CHAIN_REGRESSED
- TEAM_OPPORTUNITY_BALANCE_PRESERVED
- DENSITY_CALIBRATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Recommendation
- recommendation: IMPROVE_RESET_TO_DANGER_GATE
- nextSprintRecommendation: Sprint 6O - Earned Danger Gate Follow-up Without Score Adjustment
