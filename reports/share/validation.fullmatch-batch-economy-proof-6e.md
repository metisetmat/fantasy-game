# Full-Match Batch Economy Proof 6E Validation

Status: PASS

## Checks
- PASS: batch full-match runner exists. - FULL_MATCH_BATCH_ECONOMY_PROOF
- PASS: matchCount >= 50. - 50
- PASS: seed variation exists. - 50
- PASS: unique scorelines visible. - 7
- PASS: score distribution visible. - 7
- PASS: scoring family distribution visible. - family counters visible
- PASS: blowout and severe blowout rates visible. - 100/16
- PASS: official path connected in all runs.
- PASS: calibrations applied in all runs.
- PASS: score from score_change in all runs.
- PASS: no score cap. - 0
- PASS: no post-hoc rewrite. - 0
- PASS: no event deletion. - 0
- PASS: no forced opponent score. - 0
- PASS: scoring constants unchanged. - 0
- PASS: MatchBonusEvent unchanged. - 0
- PASS: batch/live separation preserved. - 0
- PASS: no persistence or SQLite scoring use. - 0/0
- PASS: no UNKNOWN scoring family. - 0
- PASS: no PENALTY_SHOT leakage. - 0
- PASS: report section visible.
- PASS: recommendation visible. - TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT
- PASS: PASS/PARTIAL/FAIL status justified. - PARTIAL
- PASS: partial economy warnings are explicit when economy is not PASS. - FULL_MATCH_BATCH_PARTIAL, TOO_MANY_SHOT_ONLY_MATCHES, SHOT_GOAL_SHARE_TOO_HIGH, NON_SHOT_SCORING_TOO_LOW, TRY_DROP_PRESENCE_TOO_LOW, TOO_MANY_SHUTOUTS, TOO_MANY_BLOWOUTS, SCORELINE_VARIATION_LOW, FULL_MATCH_BATCH_ECONOMY_NEEDS_TARGETED_FIX
- PASS: trace validation model remains available. - available
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
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

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT
- Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability
