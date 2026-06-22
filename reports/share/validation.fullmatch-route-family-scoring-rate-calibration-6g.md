# Full-Match Route Family Scoring Rate Calibration 6G Validation

Status: PASS

## Checks
- PASS: scoring rate calibration model exists - FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION
- PASS: baseline 6F metrics are visible - 45.1/14.8
- PASS: batch 50 matches after calibration exists - 50
- PASS: TRY route remains available - 50
- PASS: DROP route remains available - 95
- PASS: CONVERSION only after TRY - 161/167
- PASS: continuation remains available - 55
- PASS: scoringEventsPerMatch decreases versus 6F - 14.8 -> 12.5
- PASS: averageTotalPoints decreases versus 6F - 45.1 -> 39.2
- PASS: blowoutRate decreases versus 6F - 82% -> 68%
- PASS: severeBlowoutRate decreases versus 6F - 52% -> 42%
- PASS: conversionSuccessRate is measured and not automatic - 63%
- PASS: route family diversity preserved - 50/0
- PASS: score from score_change
- PASS: no cap
- PASS: no post-hoc rewrite
- PASS: no event deletion
- PASS: no forced score
- PASS: scoring constants unchanged
- PASS: MatchBonusEvent unchanged
- PASS: batch/live separation preserved
- PASS: no UNKNOWN - 0
- PASS: no PENALTY_SHOT leakage - 0
- PASS: no persistence/SQLite scoring
- PASS: PASS/PARTIAL/FAIL justified - PASS
- PASS: share pack PASS - validated by validation.share-pack.md after reports:share

## Counts
- matchCount: 50
- scoringEventsPerMatch before: 14.8
- scoringEventsPerMatch after: 12.5
- averageTotalPoints before: 45.1
- averageTotalPoints after: 39.2
- blowoutRate before: 82%
- blowoutRate after: 68%
- severeBlowoutRate before: 52%
- severeBlowoutRate after: 42%
- conversionSuccessRate after: 63%
- tryScoringRate after: 65%
- dropSuccessRate after: 35%
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Recommendation
- REDUCE_SEGMENT_SCORING_DENSITY_NEXT
- Sprint 6H - Segment Scoring Density Calibration

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
