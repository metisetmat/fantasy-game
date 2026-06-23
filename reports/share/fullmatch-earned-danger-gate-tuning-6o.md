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
- averageTotalPointsAfter: 30.3
- scoringEventsPerMatchAfter: 9.7
- scoringOpportunitiesPerMatchAfter: 21.3
- blowoutRateAfter: 56%
- severeBlowoutRateAfter: 22%
- closeGameRateAfter: 28%
- resetToDangerRateAfter: 5.6%
- earnedDangerRateAfter: 3.6%
- borderlineDangerRateAfter: 1.9%
- automaticDangerSuspicionRateAfter: 0%

## Before / After Table
| metric | before | after | movement |
| --- | ---: | ---: | --- |
| average total points | 30.6 | 30.3 | down |
| scoring events per match | 9.7 | 9.7 | flat |
| scoring opportunities per match | 20.5 | 21.3 | up |
| blowout rate | 42% | 56% | up |
| severe blowout rate | 14% | 22% | up |
| earned danger | 0% | 3.6% | up |
| borderline danger | 0% | 1.9% | up |
| automatic danger suspicion | 0% | 0% | flat |
| rebuild phase insertion | 2% | 0% | down |

## Gate Tuning Audit Summary
- gateAllowedEarnedDangerCountBefore: 0
- gateAllowedEarnedDangerCountAfter: 15
- gateAllowedBorderlineDangerCountBefore: 0
- gateAllowedBorderlineDangerCountAfter: 8
- gateBlockedAutomaticDangerCountBefore: 1
- gateBlockedAutomaticDangerCountAfter: 390
- gateTooStrictSuspicionCountAfter: 0
- gateTooLooseSuspicionCountAfter: 0
- earnedDangerLostByTooStrictGateCountAfter: 0
- borderlineDangerLostByTooStrictGateCountAfter: 0
- automaticDangerAllowedByTooLooseGateCountAfter: 0

## Gate Decision Distribution
| decision | count |
| --- | ---: |
| ALLOW_DANGER | 15 |
| ALLOW_BORDERLINE_DANGER | 8 |
| FORCE_REBUILD_PHASE | 390 |

## Earned Danger Classification Distribution
| classification | count |
| --- | ---: |
| EARNED | 15 |
| BORDERLINE | 8 |
| BLOCKED_BY_GATE | 390 |

## Allowed Danger Reason Code Distribution
| reason code | count |
| --- | ---: |
| SUPPORT_EDGE | 23 |
| TACTICAL_EDGE | 23 |
| ATTRIBUTE_EDGE | 23 |

## Denied Danger Reason Code Distribution
| reason code | count |
| --- | ---: |
| NEUTRAL_REBUILD_REQUIRED | 390 |
| SAFE_POSSESSION_REQUIRED | 195 |

## Root Cause Audit Consistency
- rootCauseContradictionCount: 0
| root cause | count |
| --- | ---: |
| none | 0 |

## Preservation Checks
- densityCalibrationPreserved: false
- routeFamilyMixPreserved: true
- teamOpportunityBalancePreserved: true
- dominanceChainsPreservedOrImproved: false
- goalkeeperSecureResetPreserved: true
- postScoreResetPreserved: true
- resetSpecificityPreserved: true

## Route Family Mix By Team
- home: {"SHOT_GOAL":406,"TRY_TOUCHDOWN":85,"CONVERSION_GOAL":83,"DROP_GOAL":73,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":193}
- away: {"SHOT_GOAL":188,"TRY_TOUCHDOWN":79,"CONVERSION_GOAL":78,"DROP_GOAL":72,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":197}

## Route Family Mix Distribution
| route family mix | matches |
| --- | ---: |
| MULTI_FAMILY | 50 |

## Scoreline Distribution
| scoreline | matches |
| --- | ---: |
| 12 - 14 | 2 |
| 12 - 2 | 2 |
| 14 - 14 | 2 |
| 14 - 26 | 2 |
| 16 - 14 | 2 |
| 19 - 21 | 2 |
| 29 - 2 | 2 |
| 33 - 7 | 2 |
| 4 - 29 | 2 |
| 11 - 0 | 1 |
| 12 - 21 | 1 |
| 12 - 4 | 1 |

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
- SEVERE_BLOWOUT_STILL_HIGH
- ROOT_CAUSE_AUDIT_CONSISTENT
- DENSITY_REGRESSED
- TEAM_BALANCE_PRESERVED
- ROUTE_FAMILY_MIX_PRESERVED
- POST_SCORE_RESET_PRESERVED
- GOALKEEPER_SECURE_RESET_PRESERVED
- DOMINANCE_CHAIN_REGRESSED
- SCORING_GUARDRAILS_CLEAN
- PARTIAL_PROGRESS_REQUIRES_MONITORING

## Recommendation
- recommendation: REVIEW_VOLUME_WITHOUT_SCORE_REWRITE
- nextSprintRecommendation: Sprint 6P - Earned Danger Gate Follow-up Without Score Adjustment
