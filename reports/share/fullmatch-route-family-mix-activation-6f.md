# Full-Match Route Family Mix Activation 6F

Sprint 6F activates official non-shot route families in the full-match scoring path. It makes TRY_TOUCHDOWN, DROP_GOAL, CONVERSION_GOAL after a valid try, and continuation routes available to compete before official score_change emission. It does not change scoring values, does not force scores, and does not use diagnostics as official scoring truth.

## Summary
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

## Single-Run Route Family Availability
| Family | Candidates | Eligible | Selected | Resolved | Scoring | Non-scoring | Unavailable reasons | Suppression reasons |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| SHOT_GOAL | 800 | 800 | 50 | 50 | 270 | 0 | none | none |
| TRY_TOUCHDOWN | 800 | 800 | 43 | 43 | 170 | 0 | none | none |
| CONVERSION_GOAL | 800 | 170 | 43 | 43 | 170 | 0 | CONVERSION_REQUIRES_TRY | none |
| DROP_GOAL | 800 | 800 | 45 | 45 | 128 | 0 | none | none |
| CONTINUATION | 800 | 800 | 21 | 21 | 0 | 21 | none | NON_SHOT_AFFORDANCE_NOT_PROMOTED_TO_OFFICIAL_CANDIDATE |

## Route Family Mix Model
- official danger phase / possession phase -> route family candidate generation -> availability gates -> ranking / competition -> selected official route family -> family-specific resolver -> official outcome -> score_change only if scoring outcome is valid
- SHOT_GOAL remains active and uncapped.
- TRY_TOUCHDOWN can score through legal access, grounding support, and contact survival.
- CONVERSION_GOAL is generated only after a TRY_TOUCHDOWN route scored.
- DROP_GOAL can score through open-play timing, kicker profile, and balance.
- Continuation can preserve possession without score_change.
- PENALTY_SHOT remains inactive.

## Team Opportunity Balance
- homePossessionDangerPhases: 50
- awayPossessionDangerPhases: 50
- homeScoringOpportunities: 50
- awayScoringOpportunities: 50
- homeEligibleNonShotRoutes: 50
- awayEligibleNonShotRoutes: 50
- oneSidedOpportunityRisk: false
- oneSidedScoringRisk: false
- recommendation: KEEP_MONITORING

## Batch Proof 50 Matches
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 45
- averageTotalPoints: 45.1
- averageScoreDifference: 26.4
- blowoutRate: 82%
- severeBlowoutRate: 52%
- shutoutRate: 12%
- oneSidedScoringRate: 12%
- matchesWithOnlyShotGoals: 0
- matchesWithTryOrDrop: 50
- matchesWithMultipleScoringFamilies: 50
- tryDropPresenceRate: 100%
- nonShotPointShare: 64%

## Scoring Events By Family
- events SHOT_GOAL: 270
- events TRY_TOUCHDOWN: 170
- events CONVERSION_GOAL: 170
- events DROP_GOAL: 128
- events PENALTY_SHOT: 0
- events UNKNOWN: 0

## Scoring Points By Family
- points SHOT_GOAL: 810
- points TRY_TOUCHDOWN: 850
- points CONVERSION_GOAL: 340
- points DROP_GOAL: 256
- points PENALTY_SHOT: 0
- points UNKNOWN: 0

## Scoring Points Share By Family
- share percent SHOT_GOAL: 36
- share percent TRY_TOUCHDOWN: 38
- share percent CONVERSION_GOAL: 15
- share percent DROP_GOAL: 11
- share percent PENALTY_SHOT: 0
- share percent UNKNOWN: 0

## Scoreline Distribution
| Scoreline | Matches |
| --- | ---: |
| 15 - 6 | 2 |
| 23 - 7 | 2 |
| 26 - 0 | 2 |
| 38 - 0 | 2 |
| 50 - 8 | 2 |
| 14 - 29 | 1 |
| 16 - 24 | 1 |
| 18 - 28 | 1 |
| 18 - 35 | 1 |
| 18 - 4 | 1 |
| 19 - 7 | 1 |
| 2 - 19 | 1 |

## Route Family Mix Distribution
| Route family mix | Matches |
| --- | ---: |
| MULTI_FAMILY | 50 |

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
- no UNKNOWN scoring family

## Warnings
- ROUTE_FAMILY_MIX_ACTIVATED
- NON_SHOT_ROUTES_AVAILABLE
- TRY_ROUTE_AVAILABLE
- DROP_ROUTE_AVAILABLE
- CONVERSION_GENERATED_AFTER_TRY
- CONVERSION_WITHOUT_TRY_BLOCKED
- SHOT_ONLY_RISK_REDUCED

## Recommendation
- KEEP_ROUTE_FAMILY_MIX_MONITORING
- Sprint 6G - Route Family Economy Balance Monitoring

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

Trace validation status: PASS.
