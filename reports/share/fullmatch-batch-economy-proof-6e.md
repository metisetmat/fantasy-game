# Full-Match Batch Economy Proof 6E

Sprint 6E runs a 50-match full-match batch through the official 6D scoring path. It measures the connected economy without changing point values, without score caps, without post-hoc rewrites, and without using persistence or SQLite as a scoring source.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_BATCH_ECONOMY_PROOF
- version: FULL_MATCH_BATCH_ECONOMY_6E
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 7
- averageScore: 16.3 total points
- averageTotalPoints: 16.3
- medianTotalPoints: 15
- averageScoreDifference: 16.3
- medianScoreDifference: 15
- maxScoreDifference: 21
- blowoutRate: 100%
- severeBlowoutRate: 16%
- shutoutRate: 100%
- zeroZeroRate: 0%
- oneSidedScoringRate: 100%
- scoringEventsPerMatch: 5.4
- averageShotGoalEventsPerMatch: 5.4
- averageTryEventsPerMatch: 0
- averageDropEventsPerMatch: 0
- averageConversionEventsPerMatch: 0
- matchesWithOnlyShotGoals: 50
- matchesWithTryOrDrop: 0
- matchesWithMultipleScoringFamilies: 0
- nonShotPointShare: 0%
- tryDropPresenceRate: 0%
- calibrationAppliedAllRuns: true
- officialPathConnectedAllRuns: true
- legacyPathLeakageCount: 0
- fallbackPathLeakageCount: 0
- parallelPathLeakageCount: 0
- scoreFromScoreChangeAllRuns: true
- scoreCapAppliedCount: 0
- postHocRewriteCount: 0
- scoringEventDeletionCount: 0
- forcedOpponentScoreCount: 0
- scoringConstantsChangedCount: 0
- MatchBonusEventChangedCount: 0
- batchLiveContaminationCount: 0
- persistenceUsedForScoringCount: 0
- sqliteUsedForScoringCount: 0
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0
- warnings: FULL_MATCH_BATCH_PARTIAL, TOO_MANY_SHOT_ONLY_MATCHES, SHOT_GOAL_SHARE_TOO_HIGH, NON_SHOT_SCORING_TOO_LOW, TRY_DROP_PRESENCE_TOO_LOW, TOO_MANY_SHUTOUTS, TOO_MANY_BLOWOUTS, SCORELINE_VARIATION_LOW, FULL_MATCH_BATCH_ECONOMY_NEEDS_TARGETED_FIX
- recommendation: TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT
- nextSprintRecommendation: Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability

## Scoring Events By Family
- events SHOT_GOAL: 271
- events TRY_TOUCHDOWN: 0
- events CONVERSION_GOAL: 0
- events DROP_GOAL: 0
- events PENALTY_SHOT: 0
- events UNKNOWN: 0

## Scoring Points By Family
- points SHOT_GOAL: 813
- points TRY_TOUCHDOWN: 0
- points CONVERSION_GOAL: 0
- points DROP_GOAL: 0
- points PENALTY_SHOT: 0
- points UNKNOWN: 0

## Scoring Points Share By Family
- share percent SHOT_GOAL: 100
- share percent TRY_TOUCHDOWN: 0
- share percent CONVERSION_GOAL: 0
- share percent DROP_GOAL: 0
- share percent PENALTY_SHOT: 0
- share percent UNKNOWN: 0

## Scoreline Distribution
| Scoreline | Matches |
| --- | ---: |
| 15 - 0 | 12 |
| 18 - 0 | 10 |
| 21 - 0 | 8 |
| 12 - 0 | 7 |
| 0 - 15 | 5 |
| 0 - 18 | 5 |
| 0 - 12 | 3 |

## Route Family Mix Distribution
| Route family mix | Matches |
| --- | ---: |
| SHOT_ONLY | 50 |

## Guardrails
- score from official score_change consequences in all runs
- no score cap
- no post-hoc score rewrite
- no scoring event deletion after generation
- no forced opponent score
- scoring constants unchanged
- MatchBonusEvent unchanged
- batch/live separation preserved
- persistence and SQLite are not scoring sources
- PENALTY_SHOT inactive

## Interpretation
- Batch status: PARTIAL.
- The official path is connected and the technical guardrails are clean, but the economy still needs targeted gameplay work before it can be treated as confirmed.
- Main economy signal: SHOT_GOAL point share 100%, try/drop presence 0%, shutout rate 100%, unique scorelines 7.

## Warnings
- FULL_MATCH_BATCH_PARTIAL
- TOO_MANY_SHOT_ONLY_MATCHES
- SHOT_GOAL_SHARE_TOO_HIGH
- NON_SHOT_SCORING_TOO_LOW
- TRY_DROP_PRESENCE_TOO_LOW
- TOO_MANY_SHUTOUTS
- TOO_MANY_BLOWOUTS
- SCORELINE_VARIATION_LOW
- FULL_MATCH_BATCH_ECONOMY_NEEDS_TARGETED_FIX

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT
- Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability

Trace validation status: PASS.
