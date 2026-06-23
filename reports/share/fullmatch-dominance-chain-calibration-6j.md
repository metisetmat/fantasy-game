# Full-Match Dominance Chain Calibration 6J

Sprint 6J reduces sticky same-team opportunity chains without forcing scores, capping scores, deleting events, changing point values, or reverting to SHOT_ONLY.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION
- version: DOMINANCE_CHAIN_6J
- matchCount: 50
- baselineVersion: TEAM_OPPORTUNITY_BALANCE_6I
- calibrationVersion: DOMINANCE_CHAIN_6J
- recommendation: IMPROVE_BREAK_EVENTS
- nextSprintRecommendation: Sprint 6K - Dominance Chain Follow-up And Break Event Calibration

## Baseline 6I Summary
- dominantTeamOpportunityChainMax: 16
- sameTeamConsecutiveOpportunityRate: 74%
- sameFamilyConsecutiveOpportunityRate: 54%
- average score difference: 11.1
- blowout rate: 48%
- opportunityBalanceIndex: 76

## After Calibration Summary
- dominantTeamOpportunityChainMax: 3
- dominantTeamDangerPhaseChainMax: 9
- dominantTeamScoringEventChainMax: 7
- sameTeamConsecutiveOpportunityRate: 8.2%
- sameFamilyConsecutiveOpportunityRate: 0.8%
- postScoreImmediateReattackRate: 78.4%
- average total points: 21.8
- average score difference: 12.2
- blowout rate: 58%
- severe blowout rate: 4%

## Before / After Table
| Metric | 6I baseline | 6J after | Direction |
| --- | ---: | ---: | --- |
| dominant team opportunity chain | 16 | 3 | reduced |
| same-team consecutive opportunity rate | 74% | 8.2% | reduced |
| same-family consecutive opportunity rate | 54% | 0.8% | reduced |
| post-score immediate reattack rate | 38% | 78.4% | not reduced |
| average score difference | 11.1 | 12.2 | regressed |
| blowout rate | 48% | 58% | not reduced |

## Dominance Chain Metrics
- dominantTeamOpportunityChainMax: 3
- dominantTeamDangerPhaseChainMax: 9
- dominantTeamScoringEventChainMax: 7
- dominantTeamPointRunMax: 27
- sameZoneConsecutiveOpportunityRate: 8.3%
- dominanceDecayAppliedCount: 0

## Break Dominance Metrics
- resetBreaksDominanceRate: 45% -> 100%
- defensiveRecoveryBreaksDominanceRate: 74% -> 34%
- goalkeeperSecureBreaksDominanceRate: 0% -> 0%
- turnoverBreaksDominanceRate: 0% -> 34%
- neutralPhaseBreaksDominanceRate: 45% -> 82%
- trailingTeamResponseAfterDominanceRate: 14.5%

## Team Opportunity Balance Preservation
- teamOpportunityBalancePreserved: true
- opportunityBalanceIndex: 76 -> 76
- scoringBalanceIndex: 76 -> 81
- pointBalanceIndex: 75 -> 81
- trailingTeamResponseRate: 52.3% -> 46.1%

## Density Preservation Metrics
- densityCalibrationPreserved: true
- scoringOpportunitiesPerMatchAfter: 15.8
- scoringEventsPerMatchAfter: 7.1
- averageTotalPointsAfter: 21.8
- continuationSelectionRate: 44.2%

## Route Family Mix By Team
- home route family SHOT_GOAL: 398
- home route family TRY_TOUCHDOWN: 34
- home route family CONVERSION_GOAL: 34
- home route family DROP_GOAL: 25
- home route family PENALTY_SHOT: 0
- home route family UNKNOWN: 0
- home route family CONTINUATION: 316
- away route family SHOT_GOAL: 201
- away route family TRY_TOUCHDOWN: 37
- away route family CONVERSION_GOAL: 36
- away route family DROP_GOAL: 26
- away route family PENALTY_SHOT: 0
- away route family UNKNOWN: 0
- away route family CONTINUATION: 311

## Scoreline Distribution
- 19 - 7: 6
- 12 - 7: 2
- 14 - 2: 2
- 14 - 7: 2
- 17 - 0: 2
- 19 - 2: 2
- 2 - 19: 2
- 22 - 2: 2
- 22 - 7: 2
- 7 - 16: 2
- 0 - 11: 1
- 11 - 0: 1

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
- DOMINANCE_CHAIN_CALIBRATED
- DOMINANCE_CHAIN_REDUCED
- SAME_TEAM_OPPORTUNITY_CHAIN_REDUCED
- SAME_FAMILY_REPEAT_REDUCED
- RESET_BREAKS_DOMINANCE_IMPROVED
- GOALKEEPER_SECURE_BREAKS_DOMINANCE_IMPROVED
- TEAM_OPPORTUNITY_BALANCE_PRESERVED
- DENSITY_CALIBRATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- BLOWOUT_RATE_STILL_TOO_HIGH
- FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Recommendation
- IMPROVE_BREAK_EVENTS
- Sprint 6K - Dominance Chain Follow-up And Break Event Calibration

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share