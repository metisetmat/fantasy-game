# Validation - Full-Match Route Economy Recheck After Selectivity Fix 6Q

Status: PASS

## Counts
- matchCount: 50
- earnedDangerToScoringOpportunityRateAfter: 100%
- borderlineDangerToScoringOpportunityRateAfter: 26.3%
- continuationToScoringOpportunityRateAfter: 0.8%
- goalkeeperSecureToDangerAgainstRateAfter: 3.5%
- scoringOpportunitiesPerMatchAfter: 15.9
- scoringEventsPerMatchAfter: 7.3
- averageTotalPointsAfter: 22.7
- severeBlowoutRateAfter: 0%
- recommendation: MONITOR_ROUTE_ECONOMY_PARTIAL

## Checks
- PASS: route economy recheck model exists - FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: route economy audit exists - routeEconomyWindowCount: 117
- PASS: danger quality distribution measured - quality measured
- PASS: danger outcome distribution measured - outcomes measured
- PASS: earnedDangerToScoringOpportunityRate measured - 100%
- PASS: earnedDangerToScoringOpportunityRate reduced or explained - 100%
- PASS: borderlineDangerToScoringOpportunityRate measured - 26.3%
- PASS: borderlineDangerToScoringOpportunityRate reduced or explained - 26.3%
- PASS: continuationToScoringOpportunityRate measured - 0.8%
- PASS: goalkeeper secure follow-up clarified - 3.5% / 100%
- PASS: route quality gate connected - 100%
- PASS: opportunity quality gate connected - 103
- PASS: half chance layer measured - 3.4%
- PASS: forced defensive action layer measured - 0.9%
- PASS: territorial gain layer measured - 6%
- PASS: scoringOpportunitiesPerMatch preserved - 15.9
- PASS: scoringEventsPerMatch preserved - 7.3
- PASS: averageTotalPoints preserved - 22.7
- PASS: severeBlowoutRate preserved - 0%
- PASS: gate selectivity preserved - true
- PASS: earned danger preserved - true
- PASS: automatic danger remains low - true
- PASS: goalkeeper secure gains preserved - true
- PASS: post-score reset preserved - true
- PASS: dominance chain healthy or explicitly monitored - dominanceChainsPreservedOrImproved: false; status: PARTIAL
- PASS: team opportunity balance preserved - true
- PASS: route family diversity preserved - true
- PASS: TRY route remains available - 28.6%
- PASS: DROP route remains available - 5.8%
- PASS: CONVERSION only after TRY - 10.9%
- PASS: CONTINUATION remains available - continuation present
- PASS: score from score_change - score_change source
- PASS: no cap - scoreCapApplied false
- PASS: no post-hoc rewrite - postHocRewriteApplied false
- PASS: no event deletion - scoringEventsDeleted false
- PASS: no forced score - forcedOpponentScoreApplied false
- PASS: no forced trailing team score - forcedTrailingTeamScoreApplied false
- PASS: scoring constants unchanged - SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive
- PASS: MatchBonusEvent unchanged - MatchBonusEvent false
- PASS: batch/live separation preserved - batch/live true
- PASS: no UNKNOWN - unknownScoringFamilyCount: 0
- PASS: no PENALTY_SHOT leakage - penaltyShotActiveLeakageCount: 0
- PASS: no persistence/SQLite scoring - persistence/SQLite false
- PASS: no contradictory healthy warning - healthy warning guarded
- PASS: share pack PASS - validated by validation.share-pack.md

## Explicit Exhaustive Test Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`
