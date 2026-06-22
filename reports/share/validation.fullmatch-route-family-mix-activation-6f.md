# Full-Match Route Family Mix Activation 6F Validation

Status: PASS

## Checks
- PASS: official route family mix model exists. - FULL_MATCH_ROUTE_FAMILY_MIX_ACTIVATION
- PASS: non-shot route availability audit exists. - 5
- PASS: TRY route can be available in official path. - 800
- PASS: DROP route can be available in official path. - 800
- PASS: CONVERSION only generated after TRY.
- PASS: CONVERSION without TRY blocked.
- PASS: route family competition can select non-shot. - SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, CONTINUATION
- PASS: route family competition can select continuation. - SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, CONTINUATION
- PASS: no forced non-shot scoring.
- PASS: no forced opponent scoring.
- PASS: no score cap.
- PASS: no post-hoc rewrite.
- PASS: no event deletion.
- PASS: scoring constants unchanged.
- PASS: score from score_change.
- PASS: official path still connected.
- PASS: batch 50 matches exists. - 50
- PASS: routeFamilyMixDistribution visible. - 1
- PASS: matchesWithOnlyShotGoals measured. - 0
- PASS: matchesWithTryOrDrop measured. - 50
- PASS: teamOpportunityBalance measured. - 50/50
- PASS: route family mix is no longer 100% SHOT_ONLY. - 0/50
- PASS: matchesWithMultipleScoringFamilies > 0. - 50
- PASS: shutoutRate < 100%. - 12%
- PASS: oneSidedScoringRate < 100%. - 12%
- PASS: no UNKNOWN.
- PASS: no PENALTY_SHOT leakage.
- PASS: no persistence or SQLite scoring.
- PASS: PASS/PARTIAL/FAIL justified. - PASS
- PASS: coach export contains mix section.
- PASS: forbidden wording absent.
- PASS: share pack PASS can be generated. - validated by validation.share-pack.md after reports:share
- PASS: trace validation model remains available. - available
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
- status: PASS
- scope: FULL_MATCH_ROUTE_FAMILY_MIX_ACTIVATION
- version: ROUTE_FAMILY_MIX_6F
- routeFamiliesSupported: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, CONTINUATION
- shotCandidateCount: 800
- tryCandidateCount: 800
- dropCandidateCount: 800
- conversionCandidateCount: 800
- continuationCandidateCount: 800
- eligibleShotCandidateCount: 800
- eligibleTryCandidateCount: 800
- eligibleDropCandidateCount: 800
- eligibleConversionCandidateCount: 170
- selectedRouteFamilies: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, CONTINUATION
- scoringRouteFamilies: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL
- conversionGeneratedOnlyAfterTry: true
- conversionWithoutTryBlocked: true
- penaltyShotInactive: true
- routeFamilyCompetitionActive: true
- routeFamilyCompetitionCanSelectNonShot: true
- routeFamilyCompetitionCanSelectContinuation: true
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 45
- averageTotalPoints: 45.1
- averageScoreDifference: 26.4
- blowoutRate: 82%
- severeBlowoutRate: 52%
- shutoutRate: 12%
- oneSidedScoringRate: 12%
- scoringEventsPerMatch: 14.8
- averageShotGoalEventsPerMatch: 5.4
- averageTryEventsPerMatch: 3.4
- averageDropEventsPerMatch: 2.6
- averageConversionEventsPerMatch: 3.4
- matchesWithOnlyShotGoals: 0
- matchesWithTryOrDrop: 50
- matchesWithMultipleScoringFamilies: 50
- nonShotPointShare: 64%
- tryDropPresenceRate: 100%
- scoreFromScoreChangeAllRuns: true
- officialPathConnectedAllRuns: true
- calibrationsAppliedAllRuns: true
- noScoreCap: true
- noRewrite: true
- noDeletion: true
- noForcedScore: true
- batchLiveSeparationPreserved: true
- noUnknown: true
- noPenaltyLeakage: true
- noPersistenceScoring: true
- noSQLiteScoring: true
- warnings: ROUTE_FAMILY_MIX_ACTIVATED, NON_SHOT_ROUTES_AVAILABLE, TRY_ROUTE_AVAILABLE, DROP_ROUTE_AVAILABLE, CONVERSION_GENERATED_AFTER_TRY, CONVERSION_WITHOUT_TRY_BLOCKED, SHOT_ONLY_RISK_REDUCED
- recommendation: KEEP_ROUTE_FAMILY_MIX_MONITORING
- nextSprintRecommendation: Sprint 6G - Route Family Economy Balance Monitoring

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- KEEP_ROUTE_FAMILY_MIX_MONITORING
- Sprint 6G - Route Family Economy Balance Monitoring
