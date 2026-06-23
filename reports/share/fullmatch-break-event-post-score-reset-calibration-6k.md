# Full-Match Break Event Post-Score Reset Calibration 6K

Sprint 6K protects post-score restart rhythm with neutral break events. It does not change scoring values, rewrite scorelines, delete scoring events, or force opponent scores.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_BREAK_EVENT_POST_SCORE_RESET_CALIBRATION
- version: BREAK_EVENT_POST_SCORE_RESET_6K
- matchCount: 50
- baselineVersion: DOMINANCE_CHAIN_6J
- calibrationVersion: BREAK_EVENT_POST_SCORE_RESET_6K
- recommendation: IMPROVE_GOALKEEPER_SECURE_BREAKS
- nextSprintRecommendation: Sprint 6L - Break Event Follow-up And Goalkeeper Reset Specificity

## Baseline 6J Summary
- postScoreImmediateReattackRate: 78.4%
- postScoreResetProtectedRate: 0%
- blowout rate: 58%
- average score difference: 12.2
- defensiveRecoveryBreaksDominanceRate: 34%
- goalkeeperSecureBreaksDominanceRate: 0%
- dominanceDecayAppliedCount: 0

## After Calibration Summary
- postScoreImmediateReattackRate: 57.8%
- postScoreResetProtectedRate: 22.8%
- concedingTeamFirstPossessionRate: 23.7%
- dominanceDecayApplicationRate: 131.2%
- blowout rate: 50%
- average score difference: 11.3
- scoringEventsPerMatchAfter: 6.9
- scoringOpportunitiesPerMatchAfter: 15.5

## Before / After Table
| Metric | 6J baseline | 6K after | Direction |
| --- | ---: | ---: | --- |
| post-score immediate reattack rate | 78.4% | 57.8% | reduced |
| post-score reset protected rate | 0% | 22.8% | introduced |
| defensive recovery breaks dominance | 34% | 34% | preserved/improved |
| goalkeeper secure breaks dominance | 0% | 0% | not observed |
| dominance decay applied count | 0 | 454 | active |
| blowout rate | 58% | 50% | reduced |

## Post-Score Reset Audit Summary
- postScoreWindowsChecked: 346
- postScoreImmediateReattackCount: 200
- postScoreImmediateReattackRate: 57.8%
- postScoreResetProtectedCount: 79
- postScoreResetProtectedRate: 22.8%
- concedingTeamFirstPossessionCount: 82
- concedingTeamFirstPossessionRate: 23.7%

## Break Event Metrics
- neutralResetBreakCount: 1709
- defensiveRecoveryBreakCount: 3207
- goalkeeperSecureBreakCount: 769
- resetBreaksDominanceRate: 100%
- defensiveRecoveryBreaksDominanceRate: 34%
- goalkeeperSecureBreaksDominanceRate: 0%

## Dominance Decay Metrics
- dominanceDecayEligibleCount: 346
- dominanceDecayAppliedCount: 454
- dominanceDecayApplicationRate: 131.2%
- breakEventsImproved: true

## Dominance Chain Preservation Metrics
- dominantTeamOpportunityChainMax: 3 -> 2
- sameTeamConsecutiveOpportunityRate: 8.2% -> 6.9%
- sameFamilyConsecutiveOpportunityRate: 0.8% -> 1%
- dominanceChainsPreservedOrImproved: true

## Team Opportunity Balance Preservation Metrics
- teamOpportunityBalancePreserved: true
- opportunityBalanceIndexAfter: 70
- scoringBalanceIndexAfter: 71
- pointBalanceIndexAfter: 70
- trailingTeamResponseRateAfter: 44.6%

## Density Preservation Metrics
- densityCalibrationPreserved: true
- routeFamilyMixPreserved: true
- routeFamilyDiversityByTeamAfter: 5
- averageTotalPointsAfter: 21.1
- medianTotalPoints: 21
- maxScoreDifference: 27
- severeBlowoutRateAfter: 4%
- continuationSelectionRate: 45.1%

## Route Family Mix By Team
- home route family SHOT_GOAL: 403
- home route family TRY_TOUCHDOWN: 36
- home route family CONVERSION_GOAL: 36
- home route family DROP_GOAL: 28
- home route family PENALTY_SHOT: 0
- home route family UNKNOWN: 0
- home route family CONTINUATION: 316
- away route family SHOT_GOAL: 194
- away route family TRY_TOUCHDOWN: 24
- away route family CONVERSION_GOAL: 24
- away route family DROP_GOAL: 28
- away route family PENALTY_SHOT: 0
- away route family UNKNOWN: 0
- away route family CONTINUATION: 320

## Scoreline Distribution
- 12 - 2: 3
- 19 - 2: 3
- 11 - 0: 2
- 14 - 0: 2
- 14 - 17: 2
- 17 - 2: 2
- 17 - 7: 2
- 19 - 7: 2
- 9 - 12: 2
- 0 - 14: 1
- 12 - 5: 1
- 12 - 7: 1

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

## Warnings
- POST_SCORE_IMMEDIATE_REATTACK_REDUCED
- POST_SCORE_RESET_PROTECTED
- DEFENSIVE_RECOVERY_BREAKS_IMPROVED
- GOALKEEPER_SECURE_BREAKS_MISSING
- DOMINANCE_DECAY_APPLIED
- DENSITY_CALIBRATION_PRESERVED
- TEAM_OPPORTUNITY_BALANCE_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- BLOWOUT_RATE_STILL_TOO_HIGH
- FULL_MATCH_BATCH_ECONOMY_PARTIAL

## Recommendation
- IMPROVE_GOALKEEPER_SECURE_BREAKS
- Sprint 6L - Break Event Follow-up And Goalkeeper Reset Specificity

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share