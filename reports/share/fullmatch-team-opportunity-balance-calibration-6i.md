# Full-Match Team Opportunity Balance Calibration 6I

Sprint 6I improves access to credible opportunities for both teams after 6H reduced global density. It never caps scores, rewrites scores, deletes scoring events, forces trailing-team points, or changes scoring constants.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION
- version: TEAM_OPPORTUNITY_BALANCE_6I
- matchCount: 50
- baselineVersion: SEGMENT_SCORING_DENSITY_6H
- calibrationVersion: TEAM_OPPORTUNITY_BALANCE_6I
- recommendation: REDUCE_DOMINANCE_CHAINS_MORE
- nextSprintRecommendation: Sprint 6J - Team Response And Dominance Chain Follow-up

## Baseline 6H Summary
- scoring opportunities / match: 16.1
- scoring events / match: 7.2
- average total points: 22
- average score difference: 12.9
- blowout rate: 56%
- severe blowout rate: 8%

## After Calibration Summary
- scoring opportunities / match: 16.2
- scoring opportunities / segment: 2
- scoring events / match: 7.3
- average total points: 22.3
- average score difference: 11.1
- blowout rate: 48%
- severe blowout rate: 2%
- shutout rate: 12%
- one-sided scoring rate: 12%

## Before / After Table
| Metric | 6H baseline | 6I after | Direction |
| --- | ---: | ---: | --- |
| opportunity balance index | 68 | 76 | improved |
| danger balance index | 68 | 76 | improved |
| scoring balance index | 46 | 76 | improved |
| point balance index | 42 | 75 | improved |
| average score difference | 12.9 | 11.1 | reduced |
| blowout rate | 56% | 48% | reduced |
| one-sided scoring rate | 38% | 12% | reduced |
| trailing response rate | 28% | 52.3% | improved |
| dominant team opportunity chain | 4 | 16 | not reduced |

## Team Opportunity Balance Audit Summary
- opportunityBalanceIndex: 76
- dangerBalanceIndex: 76
- scoringBalanceIndex: 76
- pointBalanceIndex: 75
- teamOpportunityBalanceImproved: true

## Home / Away Opportunities
| Side | Opportunities | Danger phases | Neutral phases | Resets | Defensive recoveries | Continuations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| home | 500 | 500 | 1999 | 688 | 499 | 312 |
| away | 309 | 309 | 1492 | 468 | 305 | 297 |

## Home / Away Scoring
| Side | Scoring events | Score changes | Points | Point share | Non-shot routes |
| --- | ---: | ---: | ---: | ---: | ---: |
| home | 226 | 226 | 697 | 62% | 102 |
| away | 138 | 138 | 419 | 38% | 108 |

## Response After Conceding Metrics
- trailingTeamResponseRate: 52.3%
- resetToResponseRate: 39.9%
- defensiveRecoveryToDangerRate: 56.8%
- possessionAfterConcedingDangerRate: 52.3%

## Dominance Chain Metrics
- dominantTeamOpportunityChainMax: 16
- sameTeamConsecutiveOpportunityRate: 171%
- sameFamilyConsecutiveOpportunityRate: 58%

## Density Preservation Metrics
- densityCalibrationPreserved: true
- scoringOpportunitiesPerMatchAfter: 16.2
- scoringEventsPerMatchAfter: 7.3
- averageTotalPointsAfter: 22.3

## Route Family Mix By Team
- home route family SHOT_GOAL: 398
- home route family TRY_TOUCHDOWN: 36
- home route family CONVERSION_GOAL: 36
- home route family DROP_GOAL: 30
- home route family PENALTY_SHOT: 0
- home route family UNKNOWN: 0
- home route family CONTINUATION: 312
- away route family SHOT_GOAL: 201
- away route family TRY_TOUCHDOWN: 36
- away route family CONVERSION_GOAL: 34
- away route family DROP_GOAL: 38
- away route family PENALTY_SHOT: 0
- away route family UNKNOWN: 0
- away route family CONTINUATION: 297

## Scoreline Distribution
- 19 - 2: 4
- 19 - 7: 4
- 22 - 2: 3
- 11 - 0: 2
- 12 - 2: 2
- 14 - 14: 2
- 14 - 7: 2
- 17 - 14: 2
- 17 - 7: 2
- 19 - 9: 2
- 2 - 19: 2
- 7 - 17: 2

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
- noRollbackToShotOnly: true
- routeFamilyDiversityPreserved: true

## Warnings
- TEAM_OPPORTUNITY_BALANCE_CALIBRATED
- OPPORTUNITY_BALANCE_IMPROVED
- DANGER_BALANCE_IMPROVED
- SCORING_BALANCE_IMPROVED
- POINT_BALANCE_IMPROVED
- TRAILING_TEAM_RESPONSE_IMPROVED
- DOMINANT_TEAM_STILL_TOO_STICKY
- DENSITY_CALIBRATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- BLOWOUT_RATE_REDUCED
- SHUTOUT_RATE_REDUCED
- ONE_SIDED_SCORING_REDUCED
- BLOWOUT_RATE_STILL_TOO_HIGH

## Recommendation
- REDUCE_DOMINANCE_CHAINS_MORE
- Sprint 6J - Team Response And Dominance Chain Follow-up

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
