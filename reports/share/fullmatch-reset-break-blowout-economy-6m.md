# Full-Match Reset Break Blowout Economy 6M

## Status
- status: PARTIAL
- scope: FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION
- version: RESET_BREAK_BLOWOUT_ECONOMY_6M
- matchCount: 50
- baselineVersion: GOALKEEPER_SECURE_RESET_BREAK_6L
- calibrationVersion: RESET_BREAK_BLOWOUT_ECONOMY_6M
- recommendation: IMPROVE_RESET_TO_DANGER_GATE
- nextSprintRecommendation: Sprint 6N - Blowout Cause Follow-up Without Score Adjustment

## Baseline 6L Summary
- blowoutRate: 48%
- averageScoreDifference: 11.6
- resetToImmediateDangerRate: 60.5%
- goalkeeperSecureBreaksDominanceRate: 100%
- postScoreImmediateReattackRate: 17.1%
- postScoreResetProtectedRate: 74%
- concedingTeamFirstPossessionRate: 72.3%

## After Calibration Summary
- averageTotalPointsAfter: 22.1
- scoringEventsPerMatchAfter: 7.2
- scoringOpportunitiesPerMatchAfter: 16
- averageScoreDifferenceAfter: 11.1
- blowoutRateAfter: 46%
- closeGameRateAfter: 28%
- competitiveGameRateAfter: 62%
- resetToImmediateDangerRateAfter: 87.4%
- automaticDangerSuspicionRateAfter: 93.2%
- earnedDangerRateAfter: 6.8%

## Before / After Table
| metric | before | after | movement |
| --- | ---: | ---: | --- |
| average total points | 21.4 | 22.1 | up |
| scoring events per match | 7 | 7.2 | up |
| scoring opportunities per match | 15.5 | 16 | up |
| average score difference | 11.6 | 11.1 | down |
| median score difference | 10 | 11 | up |
| max score difference | 30 | 27 | down |
| blowout rate | 48% | 46% | down |
| severe blowout rate | 6% | 6% | flat |
| close game rate | 38% | 28% | down |
| competitive game rate | 52% | 62% | up |
| reset to immediate danger | 60.5% | 87.4% | up |
| automatic danger suspicion | 30% | 93.2% | up |
| earned danger | 70% | 6.8% | down |

## Blowout Root Cause Audit Summary
| root cause | matches |
| --- | ---: |
| RESET_TO_DANGER_TOO_FAST | 50 |
| DANGER_NOT_ATTRIBUTE_GATED_ENOUGH | 49 |
| DANGER_NOT_TACTICALLY_EARNED | 49 |
| WINNING_TEAM_POST_RESET_DANGER_TOO_HIGH | 35 |
| WINNING_TEAM_POST_SCORE_REATTACK_TOO_HIGH | 34 |
| GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_FAST | 9 |
| LOSING_TEAM_RESPONSE_TOO_WEAK | 1 |

## Reset-To-Danger Quality Audit Summary
| warning | count |
| --- | ---: |
| AUTOMATIC_RESET_TO_DANGER_SUSPECTED | 50 |
| RESET_TO_DANGER_DESPITE_LOW_FATIGUE_EDGE | 50 |
| RESET_TO_DANGER_WITHOUT_SUPPORT | 50 |
| RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE | 50 |
| RESET_TO_IMMEDIATE_DANGER | 50 |
| RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE | 45 |
| EARNED_RESET_TO_DANGER | 13 |
| RESET_TO_DANGER_WITHOUT_SPACING | 3 |

## Close / Competitive / Blowout Metrics
- closeGameRate: 28%
- competitiveGameRate: 62%
- blowoutRate: 46%
- severeBlowoutRate: 6%
- shutoutRate: 14%
- oneSidedScoringRate: 14%

## Preservation Checks
- densityCalibrationPreserved: true
- routeFamilyMixPreserved: true
- teamOpportunityBalancePreserved: true
- dominanceChainsPreservedOrImproved: true
- goalkeeperSecureResetPreserved: true
- postScoreResetPreserved: true
- resetSpecificityPreserved: true
- blowoutEconomyImproved: true

## Route Family Mix By Team
- home: {"SHOT_GOAL":401,"TRY_TOUCHDOWN":36,"CONVERSION_GOAL":35,"DROP_GOAL":25,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":319}
- away: {"SHOT_GOAL":203,"TRY_TOUCHDOWN":34,"CONVERSION_GOAL":34,"DROP_GOAL":32,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":304}

## Route Family Mix Distribution
| route family mix | matches |
| --- | ---: |
| MULTI_FAMILY | 49 |
| SHOT_ONLY | 1 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 19 - 2 | 5 |
| 12 - 2 | 3 |
| 14 - 7 | 3 |
| 11 - 0 | 2 |
| 12 - 7 | 2 |
| 14 - 0 | 2 |
| 14 - 14 | 2 |
| 17 - 14 | 2 |
| 19 - 7 | 2 |
| 19 - 9 | 2 |
| 2 - 26 | 2 |
| 22 - 7 | 2 |

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
- RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATED
- BLOWOUT_RATE_REDUCED
- FULL_MATCH_BATCH_ECONOMY_PARTIAL
- COMPETITIVE_GAME_RATE_IMPROVED
- RESET_TO_IMMEDIATE_DANGER_CLASSIFIED
- RESET_TO_IMMEDIATE_DANGER_STILL_TOO_HIGH
- AUTOMATIC_DANGER_STILL_TOO_HIGH
- GOALKEEPER_SECURE_RESET_GAINS_PRESERVED
- POST_SCORE_RESET_GAINS_PRESERVED
- DOMINANCE_CHAIN_GAINS_PRESERVED
- TEAM_OPPORTUNITY_BALANCE_PRESERVED
- DENSITY_CALIBRATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED

## Recommendation
- recommendation: IMPROVE_RESET_TO_DANGER_GATE
- nextSprintRecommendation: Sprint 6N - Blowout Cause Follow-up Without Score Adjustment
