# Full-Match Goalkeeper Secure Reset Break Specificity 6L

Sprint 6L connects secure goalkeeper/restart moments to official non-scoring reset events. It does not change point values, cap scorelines, delete events, rewrite outcomes, or force a trailing-team score.

## Summary
- status: PARTIAL
- scope: FULL_MATCH_GOALKEEPER_SECURE_RESET_BREAK_SPECIFICITY_CALIBRATION
- version: GOALKEEPER_SECURE_RESET_BREAK_6L
- matchCount: 50
- baselineVersion: BREAK_EVENT_POST_SCORE_RESET_6K
- calibrationVersion: GOALKEEPER_SECURE_RESET_BREAK_6L
- recommendation: KEEP_GOALKEEPER_SECURE_RESET_BREAK_MONITORING
- nextSprintRecommendation: Sprint 6M - Reset Break Follow-up And Blowout Economy

## Baseline 6K Summary
- postScoreImmediateReattackRate: 57.8%
- postScoreResetProtectedRate: 22.8%
- concedingTeamFirstPossessionRate: 23.7%
- goalkeeperSecureBreakCount: 769
- goalkeeperSecureBreaksDominanceRate: 0%
- dominanceDecayApplicationRatio: 131.2%
- blowoutRate: 50%
- averageScoreDifference: 11.3

## After Calibration 6L Summary
- averageTotalPointsAfter: 21.4
- scoringEventsPerMatchAfter: 7
- scoringOpportunitiesPerMatchAfter: 15.5
- postScoreImmediateReattackRateAfter: 17.1%
- postScoreResetProtectedRateAfter: 74%
- concedingTeamFirstPossessionRateAfter: 97.7%
- goalkeeperSecureBreakCountAfter: 801
- goalkeeperSecureBreaksDominanceRateAfter: 7.2%
- goalkeeperSecureToSafePossessionRateAfter: 100%
- blowoutRateAfter: 48%

## Before / After Table
| Metric | 6K baseline | 6L after |
| --- | ---: | ---: |
| average total points | 22.7 | 21.4 |
| scoring events / match | 6.9 | 7 |
| scoring opportunities / match | 15.5 | 15.5 |
| average score difference | 11.3 | 11.6 |
| blowout rate | 50% | 48% |
| severe blowout rate | 4% | 6% |
| post-score immediate reattack rate | 57.8% | 17.1% |
| post-score reset protected rate | 22.8% | 74% |
| conceding team first possession rate | 23.7% | 97.7% |
| goalkeeper secure breaks dominance rate | 0% | 7.2% |

## Goalkeeper Secure Audit Summary
- goalkeeperSecureEventCount: 801
- goalkeeperSecureCandidateCount: 801
- goalkeeperSecureOfficialEventCount: 415
- goalkeeperSecureDiagnosticOnlyCount: 386
- goalkeeperSecureWithPossessionChangeCount: 412
- goalkeeperSecureWithResetCount: 415
- goalkeeperSecureWithNeutralPhaseCount: 415
- goalkeeperSecureWithContinuationBlockedCount: 415
- goalkeeperSecureBreaksDominanceCount: 30
- goalkeeperSecureBreaksDominanceRate: 7.2%
- goalkeeperSecureImmediateReattackAgainstRate: 18.8%
- goalkeeperSecureToRestartRate: 100%
- goalkeeperSecureToSafePossessionRate: 100%
- goalkeeperSecureToDangerAgainstRate: 18.8%

## Reset Break Specificity Audit Summary
- postScoreWindowsChecked: 350
- resetEventCreatedCount: 342
- protectedResetCount: 259
- protectedResetRate: 74%
- unprotectedResetCount: 83
- missingResetCount: 8
- concedingTeamFirstPossessionCount: 342
- concedingTeamFirstPossessionRate: 97.7%
- scoringTeamImmediateReattackCount: 60
- scoringTeamImmediateReattackRate: 17.1%
- resetBreaksDominanceCount: 52
- resetBreaksDominanceRate: 15.2%
- resetToNeutralRate: 100%
- resetToSafePossessionRate: 0.6%
- resetToImmediateDangerRate: 60.5%

## Dominance Decay Clarified Metrics
- dominanceDecayEligibleCount: 350
- dominanceDecayAppliedWindowCount: 350
- dominanceDecayApplicationsTotal: 458
- dominanceDecayWindowCoverage: 100%
- dominanceDecayApplicationsPerEligibleWindow: 1.3
- dominanceDecayApplicationRatio: 130.9%
- interpretation: this is a ratio of total applications per eligible scoring window, not a bounded rate; coverage is reported separately and is bounded at 0-100%.

## Preservation Metrics
- densityCalibrationPreserved: true
- routeFamilyMixPreserved: true
- teamOpportunityBalancePreserved: true
- dominanceChainsPreservedOrImproved: true
- dominantTeamOpportunityChainMaxAfter: 2
- sameTeamConsecutiveOpportunityRateAfter: 7.3%
- sameFamilyConsecutiveOpportunityRateAfter: 1.2%
- opportunityBalanceIndexAfter: 74
- scoringBalanceIndexAfter: 79
- pointBalanceIndexAfter: 79
- trailingTeamResponseRateAfter: 42.3%

## Route Family Mix By Team
- home: {"SHOT_GOAL":392,"TRY_TOUCHDOWN":34,"CONVERSION_GOAL":34,"DROP_GOAL":28,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":322}
- away: {"SHOT_GOAL":197,"TRY_TOUCHDOWN":31,"CONVERSION_GOAL":31,"DROP_GOAL":29,"PENALTY_SHOT":0,"UNKNOWN":0,"CONTINUATION":319}

## Scoreline Distribution
- 14 - 7: 5
- 17 - 7: 3
- 19 - 0: 3
- 12 - 2: 2
- 14 - 0: 2
- 15 - 7: 2
- 2 - 19: 2
- 7 - 19: 2
- 0 - 18: 1
- 0 - 19: 1
- 11 - 0: 1
- 12 - 7: 1

## Route Family Mix Distribution
- MULTI_FAMILY: 50

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
- GOALKEEPER_SECURE_RESET_BREAK_CALIBRATED
- DOMINANCE_DECAY_METRICS_CLARIFIED
- GOALKEEPER_SECURE_BREAK_EFFECTIVE
- GOALKEEPER_SECURE_BREAK_CONNECTED
- GOALKEEPER_SECURE_IMMEDIATE_REATTACK_REDUCED
- POST_SCORE_IMMEDIATE_REATTACK_REDUCED
- POST_SCORE_RESET_PROTECTED_IMPROVED
- CONCEDING_TEAM_FIRST_POSSESSION_IMPROVED
- DEFENSIVE_RECOVERY_BREAKS_DOMINANCE_IMPROVED
- DOMINANCE_CHAIN_GAINS_PRESERVED
- TEAM_OPPORTUNITY_BALANCE_PRESERVED
- DENSITY_CALIBRATION_PRESERVED
- ROUTE_FAMILY_DIVERSITY_PRESERVED
- BLOWOUT_RATE_REDUCED
- FULL_MATCH_BATCH_ECONOMY_HEALTHY

## Recommendation
- recommendation: KEEP_GOALKEEPER_SECURE_RESET_BREAK_MONITORING
- nextSprintRecommendation: Sprint 6M - Reset Break Follow-up And Blowout Economy