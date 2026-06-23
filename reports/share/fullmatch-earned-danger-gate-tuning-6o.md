# Full-Match Earned Danger Gate Tuning 6O

## Status
- status: PARTIAL
- scope: FULL_MATCH_EARNED_DANGER_GATE_TUNING
- version: EARNED_DANGER_GATE_TUNING_6O
- matchCount: 50
- baselineVersion: EARNED_DANGER_GATE_6N
- calibrationVersion: EARNED_DANGER_GATE_TUNING_6O
- recommendation: REVIEW_VOLUME_WITHOUT_SCORE_REWRITE
- nextSprintRecommendation: Sprint 6P - Earned Danger Gate Follow-up Without Score Adjustment

## Baseline 6N Summary
- averageTotalPoints: 30.6
- scoringEventsPerMatch: 9.7
- scoringOpportunitiesPerMatch: 20.5
- severeBlowoutRate: 14%
- resetToDangerRate: 0%
- resetToImmediateDangerRate: 0%
- earnedDangerRate: 0%
- borderlineDangerRate: 0%
- automaticDangerSuspicionRate: 0%

## After Gate Tuning Summary
- averageTotalPointsAfter: 39.5
- scoringEventsPerMatchAfter: 12.6
- scoringOpportunitiesPerMatchAfter: 28.1
- blowoutRateAfter: 50%
- severeBlowoutRateAfter: 28%
- closeGameRateAfter: 32%
- resetToDangerRateAfter: 100%
- earnedDangerRateAfter: 99.8%
- borderlineDangerRateAfter: 0.2%
- automaticDangerSuspicionRateAfter: 0%

## Before / After Table
| metric | before | after | movement |
| --- | ---: | ---: | --- |
| average total points | 30.6 | 39.5 | up |
| scoring events per match | 9.7 | 12.6 | up |
| scoring opportunities per match | 20.5 | 28.1 | up |
| blowout rate | 42% | 50% | up |
| severe blowout rate | 14% | 28% | up |
| earned danger | 0% | 99.8% | up |
| borderline danger | 0% | 0.2% | up |
| automatic danger suspicion | 0% | 0% | flat |
| rebuild phase insertion | 2% | 0% | down |

## Gate Tuning Audit Summary
- observedGateRowCount: 550
- gateAllowedEarnedDangerCountBefore: 0
- gateAllowedEarnedDangerCountAfter: 549
- gateAllowedBorderlineDangerCountBefore: 0
- gateAllowedBorderlineDangerCountAfter: 1
- gateBlockedAutomaticDangerCountBefore: 1
- gateBlockedAutomaticDangerCountAfter: 0
- gateTooStrictSuspicionCountAfter: 0
- gateTooLooseSuspicionCountAfter: 0
- earnedDangerLostByTooStrictGateCountAfter: 0
- borderlineDangerLostByTooStrictGateCountAfter: 0
- automaticDangerAllowedByTooLooseGateCountAfter: 0

## Gate Decision Distribution
| decision | count |
| --- | ---: |
| ALLOW_DANGER | 549 |
| ALLOW_BORDERLINE_DANGER | 1 |

## Earned Danger Classification Distribution
| classification | count |
| --- | ---: |
| EARNED | 549 |
| BORDERLINE | 1 |

## Allowed Danger Reason Code Distribution
| reason code | count |
| --- | ---: |
| ATTRIBUTE_EDGE | 550 |
| IMMEDIATE_AFTER_RESET | 550 |
| LOW_SPACING | 550 |
| SUPPORT_EDGE | 550 |
| TACTICAL_EDGE | 550 |
| POST_SCORE_CONTEXT | 543 |
| PRESSURE_EDGE | 478 |
| FATIGUE_EDGE | 373 |
| LEADING_TEAM_REATTACK | 277 |
| MISTAKE_EDGE | 256 |
| LOW_FATIGUE_EDGE | 177 |

## Denied Danger Reason Code Distribution
| reason code | count |
| --- | ---: |
| none | 0 |

## Root Cause Audit Consistency
- rootCauseContradictionCount: 0
| root cause | count |
| --- | ---: |
| EARNED_DANGER_REINTRODUCED | 549 |
| BORDERLINE_DANGER_REINTRODUCED | 1 |

## Preservation Checks
- densityCalibrationPreserved: false
- routeFamilyMixPreserved: true
- teamOpportunityBalancePreserved: true
- dominanceChainsPreservedOrImproved: false
- goalkeeperSecureResetPreserved: true
- postScoreResetPreserved: false
- resetSpecificityPreserved: false

## Route Family Mix By Team
- home: {"SHOT_GOAL":423,"TRY_TOUCHDOWN":129,"CONVERSION_GOAL":128,"DROP_GOAL":119,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":75}
- away: {"SHOT_GOAL":191,"TRY_TOUCHDOWN":141,"CONVERSION_GOAL":139,"DROP_GOAL":133,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":38}

## Route Family Mix Distribution
| route family mix | matches |
| --- | ---: |
| MULTI_FAMILY | 50 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 26 - 28 | 3 |
| 14 - 15 | 2 |
| 26 - 16 | 2 |
| 33 - 6 | 2 |
| 12 - 18 | 1 |
| 12 - 28 | 1 |
| 14 - 16 | 1 |
| 14 - 24 | 1 |
| 14 - 26 | 1 |
| 14 - 4 | 1 |
| 15 - 4 | 1 |
| 15 - 7 | 1 |

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
- EARNED_DANGER_REINTRODUCED
- BORDERLINE_DANGER_REINTRODUCED
- AUTOMATIC_DANGER_STILL_BLOCKED
- VOLUME_STILL_HOT
- SEVERE_BLOWOUT_STILL_HIGH
- ROOT_CAUSE_AUDIT_CONSISTENT
- DENSITY_REGRESSED
- TEAM_BALANCE_PRESERVED
- ROUTE_FAMILY_MIX_PRESERVED
- POST_SCORE_RESET_REGRESSED
- GOALKEEPER_SECURE_RESET_PRESERVED
- DOMINANCE_CHAIN_REGRESSED
- SCORING_GUARDRAILS_CLEAN
- PARTIAL_PROGRESS_REQUIRES_MONITORING

## Recommendation
- recommendation: REVIEW_VOLUME_WITHOUT_SCORE_REWRITE
- nextSprintRecommendation: Sprint 6P - Earned Danger Gate Follow-up Without Score Adjustment
