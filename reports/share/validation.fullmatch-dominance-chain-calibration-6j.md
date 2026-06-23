# Full-Match Dominance Chain Calibration 6J Validation

Status: PASS

## Counts
- matchCount: 50
- dominance audits: 50
- dominantTeamOpportunityChainMax before/after: 16/3
- sameTeamConsecutiveOpportunityRate before/after: 74/8.2
- sameFamilyConsecutiveOpportunityRate before/after: 54/0.8
- dominanceDecayAppliedCount: 0
- recommendation: IMPROVE_BREAK_EVENTS

## Checks
- PASS: dominance chain calibration model exists - FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION
- PASS: baseline 6I metrics visible - TEAM_OPPORTUNITY_BALANCE_6I
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: dominance chain audit exists - 50
- PASS: dominantTeamOpportunityChainMax measured - 3
- PASS: sameTeamConsecutiveOpportunityRate measured - 8.2%
- PASS: sameFamilyConsecutiveOpportunityRate measured - 0.8%
- PASS: dominance chains decrease versus 6I or failure justified - 16->3
- PASS: same team consecutive opportunity rate decreases versus 6I or failure justified - 74->8.2
- PASS: same family repeat decreases versus 6I or failure justified - 54->0.8
- PASS: reset breaks dominance measured - 100%
- PASS: defensive recovery breaks dominance measured - 34%
- PASS: goalkeeper secure breaks dominance measured - 0%
- PASS: team opportunity balance preserved - 76/81
- PASS: density calibration preserved - 15.8/21.8
- PASS: route family diversity preserved - 5
- PASS: TRY route remains available
- PASS: DROP route remains available
- PASS: CONVERSION only after TRY
- PASS: CONTINUATION remains available
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
- PASS: no contradictory healthy warning when dominance still weak - DOMINANCE_CHAIN_CALIBRATED,DOMINANCE_CHAIN_REDUCED,SAME_TEAM_OPPORTUNITY_CHAIN_REDUCED,SAME_FAMILY_REPEAT_REDUCED,RESET_BREAKS_DOMINANCE_IMPROVED,GOALKEEPER_SECURE_BREAKS_DOMINANCE_IMPROVED,TEAM_OPPORTUNITY_BALANCE_PRESERVED,DENSITY_CALIBRATION_PRESERVED,ROUTE_FAMILY_DIVERSITY_PRESERVED,BLOWOUT_RATE_STILL_TOO_HIGH,FULL_MATCH_BATCH_ECONOMY_PARTIAL
- PASS: PASS/PARTIAL/FAIL justified - PARTIAL

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share