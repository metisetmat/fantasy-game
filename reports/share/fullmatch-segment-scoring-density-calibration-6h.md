# Full-Match Segment Scoring Density Calibration 6H

Sprint 6H reduces the number of dangerous and scoring-opportunity beats per segment before score_change events are created. It does not cap scores, rewrite scores, delete scoring events, force opponent scores, or change scoring values.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION
- version: SEGMENT_SCORING_DENSITY_6H
- matchCount: 50
- calibrationVersion: SEGMENT_SCORING_DENSITY_CALIBRATION_6H
- densityCalibrationApplied: true
- recommendation: IMPROVE_TEAM_OPPORTUNITY_BALANCE_NEXT
- nextSprintRecommendation: Sprint 6I - Team Opportunity Balance Calibration

## Before / After Table
| Metric | 6G before | 6H after | Direction |
| --- | ---: | ---: | --- |
| scoring opportunities / match | 27.5 | 15.9 | reduced |
| scoring opportunities / segment | 3.4 | 2 | reduced |
| danger phases / match | 31.2 | 15.9 | reduced |
| scoring events / match | 12.5 | 6.9 | reduced |
| average total points | 39.2 | 21 | reduced |
| average score difference | 21.7 | 12.9 | reduced |
| blowout rate | 68% | 56% | reduced |
| severe blowout rate | 42% | 14% | reduced |
| neutral phases / match | 58 | 69.6 | increased |
| defensive recoveries / match | 6.5 | 15.9 | increased |
| reset phases / match | 19 | 42.4 | increased |

## Segment Density Audit Summary
- segment density audit exists: true
- segmentCount: 400
- scoringOpportunityCount: 797
- scoringEventCount: 360
- dangerPhaseCount: 797
- neutralPhaseCount: 3480
- defensiveRecoveryCount: 797
- resetPhaseCount: 2118
- continuationCount: 598
- consecutiveScoringOpportunityCount: 91
- sameTeamConsecutiveOpportunityCount: 317
- sameFamilyConsecutiveOpportunityCount: 205

## Scoring Opportunities By Segment
| Segment | Opportunities | Events | Points | Neutral | Defensive recoveries | Resets | Warnings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| segment-1 | 2 | 2 | 5 | 7 | 2 | 0 | TOO_FEW_RESET_PHASES |
| segment-2 | 1 | 1 | 3 | 8 | 1 | 5 | none |
| segment-3 | 1 | 1 | 3 | 8 | 1 | 4 | none |
| segment-4 | 1 | 1 | 3 | 8 | 1 | 5 | none |
| segment-5 | 3 | 1 | 3 | 8 | 3 | 3 | none |
| segment-6 | 2 | 0 | 0 | 10 | 2 | 9 | none |
| segment-7 | 2 | 0 | 0 | 10 | 2 | 9 | none |
| segment-8 | 6 | 2 | 7 | 10 | 6 | 6 | SEGMENT_SCORING_DENSITY_TOO_HIGH, TOO_MANY_DANGER_PHASES, TOO_MANY_CONSECUTIVE_SCORING_OPPORTUNITIES, SAME_TEAM_OPPORTUNITY_CHAIN_TOO_LONG, SAME_FAMILY_REPEAT_TOO_HIGH |
| segment-1 | 4 | 4 | 12 | 7 | 4 | 0 | SEGMENT_SCORING_DENSITY_TOO_HIGH, TOO_MANY_CONSECUTIVE_SCORING_OPPORTUNITIES, TOO_FEW_RESET_PHASES |
| segment-2 | 1 | 1 | 3 | 8 | 1 | 4 | none |
| segment-3 | 1 | 1 | 3 | 8 | 1 | 4 | none |
| segment-4 | 1 | 1 | 3 | 8 | 1 | 4 | none |
| segment-5 | 5 | 3 | 10 | 8 | 5 | 3 | SEGMENT_SCORING_DENSITY_TOO_HIGH, TOO_MANY_DANGER_PHASES, TOO_MANY_CONSECUTIVE_SCORING_OPPORTUNITIES, SAME_TEAM_OPPORTUNITY_CHAIN_TOO_LONG |
| segment-6 | 2 | 0 | 0 | 10 | 2 | 8 | none |
| segment-7 | 2 | 0 | 0 | 10 | 2 | 8 | none |
| segment-8 | 2 | 0 | 0 | 10 | 2 | 8 | none |
| segment-1 | 2 | 2 | 5 | 7 | 2 | 0 | TOO_FEW_RESET_PHASES |
| segment-2 | 1 | 1 | 3 | 8 | 1 | 4 | none |
| segment-3 | 2 | 1 | 3 | 9 | 2 | 6 | none |
| segment-4 | 2 | 1 | 3 | 9 | 2 | 6 | none |

## Route Family Mix After
- route family SHOT_GOAL: 591
- route family TRY_TOUCHDOWN: 69
- route family CONVERSION_GOAL: 67
- route family DROP_GOAL: 70
- route family PENALTY_SHOT: 0
- route family UNKNOWN: 0
- route family CONTINUATION: 0

## Scoring Events By Family After
- events after SHOT_GOAL: 208
- events after TRY_TOUCHDOWN: 50
- events after CONVERSION_GOAL: 50
- events after DROP_GOAL: 39
- events after PENALTY_SHOT: 0
- events after UNKNOWN: 0

## Scoring Points By Family After
- points after SHOT_GOAL: 624
- points after TRY_TOUCHDOWN: 250
- points after CONVERSION_GOAL: 100
- points after DROP_GOAL: 78
- points after PENALTY_SHOT: 0
- points after UNKNOWN: 0

## Attempts And Non-Scoring Outcomes After
- attempts after SHOT_GOAL: 595
- attempts after TRY_TOUCHDOWN: 61
- attempts after CONVERSION_GOAL: 59
- attempts after DROP_GOAL: 75
- non-scoring after SHOT_GOAL: 387
- non-scoring after TRY_TOUCHDOWN: 11
- non-scoring after CONVERSION_GOAL: 9
- non-scoring after DROP_GOAL: 36

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
- conversionOnlyAfterTry: true

## Warnings
- SEGMENT_SCORING_DENSITY_CALIBRATED
- SCORING_OPPORTUNITIES_PER_MATCH_REDUCED
- SCORING_OPPORTUNITIES_PER_SEGMENT_REDUCED
- SCORING_EVENTS_PER_MATCH_REDUCED
- AVERAGE_TOTAL_POINTS_REDUCED
- BLOWOUT_RATE_REDUCED
- SEVERE_BLOWOUT_RATE_REDUCED
- NEUTRAL_PHASES_INCREASED
- DEFENSIVE_RECOVERIES_INCREASED
- RESET_PHASES_INCREASED
- BLOWOUT_RATE_STILL_TOO_HIGH
- FULL_MATCH_BATCH_ECONOMY_PARTIAL
- CONTINUATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED

## Recommendation
- IMPROVE_TEAM_OPPORTUNITY_BALANCE_NEXT
- Sprint 6I - Team Opportunity Balance Calibration

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
