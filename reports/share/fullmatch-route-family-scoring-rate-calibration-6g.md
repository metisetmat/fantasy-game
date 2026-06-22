# Full-Match Route Family Scoring Rate Calibration 6G

Sprint 6G calibrates scoring rates after Sprint 6F activated official route-family diversity. The goal is lower scoring frequency, more non-scoring outcomes, and preserved TRY/DROP/CONVERSION/CONTINUATION availability without changing point values.

## Summary
- status: PASS
- scope: FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION
- version: ROUTE_FAMILY_SCORING_RATE_6G
- matchCount: 50
- calibrationVersion: SCORING_RATE_CALIBRATION_6G
- routeFamiliesSupported: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, CONTINUATION
- routeFamilyCompetitionActive: true
- routeFamilyCompetitionCanSelectNonShot: true
- routeFamilyCompetitionCanSelectContinuation: true

## Baseline 6F Summary
- averageTotalPointsBefore: 45.1
- averageScoreDifferenceBefore: 26.4
- blowoutRateBefore: 82%
- severeBlowoutRateBefore: 52%
- scoringEventsPerMatchBefore: 14.8
- matchesWithTryOrDropBefore: 50
- matchesWithMultipleScoringFamiliesBefore: 50
- matchesWithOnlyShotGoalsBefore: 0

## After Calibration Summary
- averageTotalPointsAfter: 39.2
- averageScoreDifferenceAfter: 21.7
- blowoutRateAfter: 68%
- severeBlowoutRateAfter: 42%
- scoringEventsPerMatchAfter: 12.5
- matchesWithTryOrDropAfter: 50
- matchesWithMultipleScoringFamiliesAfter: 50
- matchesWithOnlyShotGoalsAfter: 0
- nonShotPointShareAfter: 69%
- tryDropPresenceRateAfter: 100%

## Before / After Table
| Metric | 6F before | 6G after | Direction |
| --- | ---: | ---: | --- |
| average total points | 45.1 | 39.2 | reduced |
| scoring events / match | 14.8 | 12.5 | reduced |
| average score difference | 26.4 | 21.7 | reduced |
| blowout rate | 82% | 68% | reduced |
| severe blowout rate | 52% | 42% | reduced |

## Scoring Events By Family Before
- events before SHOT_GOAL: 270
- events before TRY_TOUCHDOWN: 170
- events before CONVERSION_GOAL: 170
- events before DROP_GOAL: 128
- events before PENALTY_SHOT: 0
- events before UNKNOWN: 0

## Scoring Events By Family After
- events after SHOT_GOAL: 204
- events after TRY_TOUCHDOWN: 167
- events after CONVERSION_GOAL: 161
- events after DROP_GOAL: 95
- events after PENALTY_SHOT: 0
- events after UNKNOWN: 0

## Scoring Points By Family Before
- points before SHOT_GOAL: 810
- points before TRY_TOUCHDOWN: 850
- points before CONVERSION_GOAL: 340
- points before DROP_GOAL: 256
- points before PENALTY_SHOT: 0
- points before UNKNOWN: 0

## Scoring Points By Family After
- points after SHOT_GOAL: 612
- points after TRY_TOUCHDOWN: 835
- points after CONVERSION_GOAL: 322
- points after DROP_GOAL: 190
- points after PENALTY_SHOT: 0
- points after UNKNOWN: 0

## Scoring Rates By Family
| Family | Rate before | Rate after | Non-scoring after | Attempts after | Scores after |
| --- | ---: | ---: | ---: | ---: | ---: |
| SHOT_GOAL | 44% | 33% | 67% | 622 | 204 |
| TRY_TOUCHDOWN | 65% | 65% | 35% | 257 | 167 |
| CONVERSION_GOAL | 100% | 63% | 37% | 254 | 161 |
| DROP_GOAL | 49% | 35% | 65% | 268 | 95 |

## Non-Scoring Outcome Rates
- non-scoring rate after SHOT_GOAL: 67
- non-scoring rate after TRY_TOUCHDOWN: 35
- non-scoring rate after CONVERSION_GOAL: 37
- non-scoring rate after DROP_GOAL: 65
- continuationSelectionRateAfter: 55%
- continuationSelectedCountAfter: 55

## Scoreline Distribution
| Scoreline | Matches |
| --- | ---: |
| 18 - 0 | 3 |
| 12 - 4 | 2 |
| 16 - 14 | 2 |
| 18 - 14 | 2 |
| 26 - 21 | 2 |
| 54 - 6 | 2 |
| 13 - 7 | 1 |
| 14 - 23 | 1 |
| 14 - 33 | 1 |
| 19 - 14 | 1 |
| 19 - 28 | 1 |
| 19 - 35 | 1 |

## Route Family Mix Distribution
| Route family mix | Matches |
| --- | ---: |
| MULTI_FAMILY | 50 |

## Team Opportunity Balance
- homeScoringEvents: 387
- awayScoringEvents: 240
- homePoints: 1227
- awayPoints: 732
- oneSidedScoringRisk: false
- recommendation: KEEP_MONITORING

## Guardrails
- scoreFromScoreChangeAllRuns: true
- officialPathConnectedAllRuns: true
- calibrationAppliedAllRuns: true
- scoringConstantsChanged: false
- scoreCapApplied: false
- postHocRewriteApplied: false
- scoringEventsDeleted: false
- forcedOpponentScoreApplied: false
- MatchBonusEventChanged: false
- batchLiveSeparationPreserved: true
- persistenceUsedForScoring: false
- sqliteUsedForScoring: false
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0
- noRollbackToShotOnly: true

## Warnings
- ROUTE_FAMILY_SCORING_RATE_CALIBRATED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- SCORING_EVENTS_PER_MATCH_REDUCED
- AVERAGE_TOTAL_POINTS_REDUCED
- BLOWOUT_RATE_REDUCED
- SEVERE_BLOWOUT_RATE_REDUCED
- CONVERSION_SUCCESS_NOT_AUTOMATIC
- DROP_SUCCESS_RATE_REDUCED
- SHOT_SUCCESS_RATE_MONITORED
- NON_SCORING_OUTCOMES_INCREASED
- CONTINUATION_PRESERVED
- SCORE_STILL_TOO_HIGH
- BLOWOUT_RATE_STILL_TOO_HIGH
- FULL_MATCH_BATCH_ECONOMY_HEALTHY

## Recommendation
- REDUCE_SEGMENT_SCORING_DENSITY_NEXT
- Sprint 6H - Segment Scoring Density Calibration

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
