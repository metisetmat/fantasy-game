# Full-Match Team Opportunity Balance Calibration 6I Validation

Status: PASS

## Checks
- PASS: team opportunity balance calibration model exists - FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION
- PASS: baseline 6H metrics visible - SEGMENT_SCORING_DENSITY_6H
- PASS: batch 50 matches after calibration exists - 50
- PASS: team opportunity audit exists - 50
- PASS: home/away scoring opportunities measured - 500/309
- PASS: home/away danger phases measured - 500/309
- PASS: home/away scoring events measured - 226/138
- PASS: home/away points measured - 697/419
- PASS: opportunityBalanceIndex measured - 76
- PASS: opportunityBalanceIndex improves versus 6H or failure justified - 68 -> 76
- PASS: dangerBalanceIndex improves versus 6H or failure justified - 68 -> 76
- PASS: scoringBalanceIndex improves versus 6H or failure justified - 46 -> 76
- PASS: pointBalanceIndex improves versus 6H or failure justified - 42 -> 75
- PASS: blowoutRate decreases versus 6H or failure justified - 56% -> 48%
- PASS: averageScoreDifference decreases versus 6H or failure justified - 12.9 -> 11.1
- PASS: oneSidedScoringRate decreases versus 6H or failure justified - 38% -> 12%
- PASS: trailingTeamResponseRate measured - 52.3%
- PASS: dominance chain measured - 16
- PASS: density calibration preserved - true
- PASS: route family diversity preserved - true
- PASS: TRY route remains available - 72
- PASS: DROP route remains available - 68
- PASS: CONVERSION only after TRY
- PASS: CONTINUATION remains available - 609
- PASS: score from score_change
- PASS: no cap
- PASS: no post-hoc rewrite
- PASS: no event deletion
- PASS: no forced score
- PASS: no forced trailing team score
- PASS: scoring constants unchanged
- PASS: MatchBonusEvent unchanged
- PASS: batch/live separation preserved
- PASS: no UNKNOWN - 0
- PASS: no PENALTY_SHOT leakage - 0
- PASS: no persistence/SQLite scoring
- PASS: no contradictory healthy warning when balance still weak - TEAM_OPPORTUNITY_BALANCE_CALIBRATED, OPPORTUNITY_BALANCE_IMPROVED, DANGER_BALANCE_IMPROVED, SCORING_BALANCE_IMPROVED, POINT_BALANCE_IMPROVED, TRAILING_TEAM_RESPONSE_IMPROVED, DOMINANT_TEAM_STILL_TOO_STICKY, DENSITY_CALIBRATION_PRESERVED, ROUTE_FAMILY_DIVERSITY_PRESERVED, BLOWOUT_RATE_REDUCED, SHUTOUT_RATE_REDUCED, ONE_SIDED_SCORING_REDUCED, BLOWOUT_RATE_STILL_TOO_HIGH
- PASS: PASS/PARTIAL/FAIL justified - PARTIAL
- PASS: share pack PASS - validated by validation.share-pack.md after reports:share

## Counts
- matchCount: 50
- uniqueSeeds: 50
- uniqueScorelines: 33
- averageTotalPoints before: 22
- averageTotalPoints after: 22.3
- scoringEventsPerMatch before: 7.2
- scoringEventsPerMatch after: 7.3
- scoringOpportunitiesPerMatch before: 16.1
- scoringOpportunitiesPerMatch after: 16.2
- averageScoreDifference before: 12.9
- averageScoreDifference after: 11.1
- blowoutRate before: 56%
- blowoutRate after: 48%
- severeBlowoutRate before: 8%
- severeBlowoutRate after: 2%
- opportunityBalanceIndex before: 68
- opportunityBalanceIndex after: 76
- trailingTeamResponseRate before: 28%
- trailingTeamResponseRate after: 52.3%
- dominantTeamOpportunityChain before: 4
- dominantTeamOpportunityChain after: 16
- warnings: 13

## Recommendation
- model status: PARTIAL
- REDUCE_DOMINANCE_CHAINS_MORE
- Sprint 6J - Team Response And Dominance Chain Follow-up

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
