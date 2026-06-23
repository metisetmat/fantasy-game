# Validation - Full-Match Gate Selectivity Volume Regression Fix 6P

Status: PASS

## Counts
- matchCount: 50
- earnedDangerRateAfter: 18.7%
- borderlineDangerRateAfter: 2.9%
- resetToDangerRateAfter: 21.6%
- scoringOpportunitiesPerMatchAfter: 17.2
- scoringEventsPerMatchAfter: 7.9
- averageTotalPointsAfter: 24.6
- severeBlowoutRateAfter: 0%
- blowoutRateAfter: 22%
- gateTooLooseSuspicionCountAfter: 0
- recommendation: KEEP_GATE_SELECTIVITY_VOLUME_FIX

## Checks
- PASS: gate selectivity volume regression fix model exists - FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX
- PASS: batch 50 matches exists - matchCount: 50
- PASS: gate selectivity audit exists - observedGateRowCount: 583
- PASS: positive reason code separation exists - positive/negative separated
- PASS: LOW_SPACING is not positive - LOW_SPACING negative
- PASS: IMMEDIATE_AFTER_RESET is not positive - IMMEDIATE_AFTER_RESET negative
- PASS: LEADING_TEAM_REATTACK is not positive - LEADING_TEAM_REATTACK negative
- PASS: POST_SCORE_CONTEXT is not positive - POST_SCORE_CONTEXT negative
- PASS: earnedDangerRate reduced from 99.8 and remains above 0 - 18.7%
- PASS: borderlineDangerRate measured - 2.9%
- PASS: resetToDangerRate reduced from 100 - 21.6%
- PASS: scoring opportunities per match reduced - 17.2
- PASS: scoring events per match reduced - 7.9
- PASS: average total points reduced - 24.6
- PASS: severe blowout rate reduced - 0%
- PASS: blowout rate reduced - 22%
- PASS: density calibration preserved - true
- PASS: dominance chains measured - 3
- PASS: goalkeeper secure gains preserved - true
- PASS: route family diversity preserved - TRY/DROP/CONVERSION/CONTINUATION present
- PASS: score from score_change - official score source
- PASS: official path connected all runs - official path connected
- PASS: calibration applied all runs - 6P tags connected
- PASS: scoring constants unchanged - SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive
- PASS: no cap - scoreCapApplied false
- PASS: no post-hoc rewrite - postHocRewriteApplied false
- PASS: no event deletion - scoringEventsDeleted false
- PASS: no forced score - forced scores false
- PASS: MatchBonusEvent unchanged - MatchBonusEvent false
- PASS: batch/live separation preserved - batch/live true
- PASS: no UNKNOWN - unknownScoringFamilyCount: 0
- PASS: no PENALTY_SHOT leakage - penaltyShotActiveLeakageCount: 0
- PASS: no contradictory healthy warning - healthy warning guarded
- PASS: share pack PASS - validated by validation.share-pack.md

## Explicit Exhaustive Test Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`
