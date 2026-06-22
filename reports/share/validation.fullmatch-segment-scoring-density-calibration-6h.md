# Full-Match Segment Scoring Density Calibration 6H Validation

Status: PASS

## Checks
- PASS: segment density calibration model exists - FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION
- PASS: batch 50 matches after calibration exists - 50
- PASS: segment density audit exists - 400
- PASS: scoring opportunities per match decrease versus 6G - 27.5 -> 16.1
- PASS: scoring opportunities per segment decrease versus 6G - 3.4 -> 2
- PASS: danger phases per match decrease versus 6G - 31.2 -> 16.1
- PASS: scoring events per match decrease versus 6G - 12.5 -> 7.2
- PASS: average total points decreases versus 6G - 39.2 -> 22
- PASS: average score difference decreases versus 6G - 21.7 -> 12.9
- PASS: blowout rate decreases versus 6G - 68% -> 56%
- PASS: severe blowout rate decreases versus 6G - 42% -> 8%
- PASS: neutral phases increase - 58 -> 69.6
- PASS: defensive recoveries increase - 6.5 -> 15.9
- PASS: reset phases increase - 19 -> 42.4
- PASS: SHOT route remains available - 591
- PASS: TRY route remains available - 72
- PASS: DROP route remains available - 72
- PASS: CONVERSION remains available after TRY - 69
- PASS: CONTINUATION remains available - 598
- PASS: no rollback to SHOT_ONLY
- PASS: score from score_change all runs
- PASS: official path connected all runs
- PASS: calibration applied all runs
- PASS: scoring constants unchanged
- PASS: no score cap
- PASS: no post-hoc rewrite
- PASS: no scoring event deletion
- PASS: no forced opponent score
- PASS: MatchBonusEvent unchanged
- PASS: batch/live separation preserved
- PASS: persistence and SQLite not used for scoring
- PASS: no UNKNOWN scoring family - 0
- PASS: no PENALTY_SHOT leakage - 0
- PASS: status can be PASS or PARTIAL when guardrails are clean - PARTIAL
- PASS: no contradictory healthy warning when blowout is still high - 56%

## Counts
- matchCount: 50
- segmentCount: 400
- scoringOpportunitiesPerMatch before: 27.5
- scoringOpportunitiesPerMatch after: 16.1
- scoringOpportunitiesPerSegment before: 3.4
- scoringOpportunitiesPerSegment after: 2
- scoringEventsPerMatch before: 12.5
- scoringEventsPerMatch after: 7.2
- averageTotalPoints before: 39.2
- averageTotalPoints after: 22
- averageScoreDifference before: 21.7
- averageScoreDifference after: 12.9
- blowoutRate before: 68%
- blowoutRate after: 56%
- severeBlowoutRate before: 42%
- severeBlowoutRate after: 8%
- neutralPhasesPerMatch before: 58
- neutralPhasesPerMatch after: 69.6
- defensiveRecoveriesPerMatch before: 6.5
- defensiveRecoveriesPerMatch after: 15.9
- resetPhasesPerMatch before: 19
- resetPhasesPerMatch after: 42.4
- warning count: 14

## Recommendation
- model status: PARTIAL
- IMPROVE_TEAM_OPPORTUNITY_BALANCE_NEXT
- Sprint 6I - Team Opportunity Balance Calibration

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
