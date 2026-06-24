# Validation - Full-Match Earned Danger Outcome Distribution 6R

Status: PASS

## Counts
- matchCount: 50
- earnedDangerToScoringOpportunityRateAfter: 84.8%
- highQualityDangerCountAfter: 97
- mediumQualityDangerCountAfter: 36
- lowQualityDangerCountAfter: 7
- halfChanceOutcomeCountAfter: 27
- forcedDefensiveActionOutcomeCountAfter: 6
- territorialGainOutcomeCountAfter: 10
- averageTotalPointsAfter: 22.4
- scoringEventsPerMatchAfter: 7.3
- scoringOpportunitiesPerMatchAfter: 16
- longitudinalWindowCount: 3
- longitudinalStableWindows: 3
- recommendation: KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION

## Checks
- PASS: earned danger outcome distribution model exists - FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: earned danger outcome distribution audit exists - 140
- PASS: danger quality distribution measured - quality measured
- PASS: danger outcome distribution measured - outcomes measured
- PASS: earnedDangerToScoringOpportunityRate reduced or justified - 84.8%
- PASS: high/medium/low quality danger counts measured - 97/36/7
- PASS: medium danger count increased or failure justified - 36
- PASS: half chance layer measured - 27
- PASS: forced defensive action layer measured - 6
- PASS: territorial gain layer measured - 10
- PASS: longitudinal validation exists - 3
- PASS: scoringOpportunitiesPerMatch preserved - 16
- PASS: scoringEventsPerMatch preserved - 7.3
- PASS: averageTotalPoints preserved - 22.4
- PASS: severeBlowoutRate preserved - 0%
- PASS: gate selectivity preserved - true
- PASS: earned danger preserved - true
- PASS: automatic danger remains low - true
- PASS: goalkeeper secure gains preserved - true
- PASS: post-score reset preserved - true
- PASS: dominance chain measured and monitored - dominantTeamOpportunityChainMaxAfter: 14
- PASS: team opportunity balance preserved - true
- PASS: route family diversity preserved - true
- PASS: TRY route remains available - 27.6%
- PASS: DROP route remains available - 5.9%
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
