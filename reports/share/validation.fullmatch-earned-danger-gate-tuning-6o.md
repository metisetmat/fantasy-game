# Validation - Full-Match Earned Danger Gate Tuning 6O

Status: PASS

## Counts
- matchCount: 50
- observedGateRowCount: 550
- earnedDangerRateAfter: 99.8%
- borderlineDangerRateAfter: 0.2%
- automaticDangerSuspicionRateAfter: 0%
- resetToDangerRateAfter: 100%
- averageTotalPointsAfter: 39.5
- scoringEventsPerMatchAfter: 12.6
- scoringOpportunitiesPerMatchAfter: 28.1
- severeBlowoutRateAfter: 28%
- gateTooStrictSuspicionCountAfter: 0
- gateTooLooseSuspicionCountAfter: 0
- rootCauseContradictionCount: 0
- recommendation: REVIEW_VOLUME_WITHOUT_SCORE_REWRITE

## Checks
- PASS: earned danger gate tuning model exists - FULL_MATCH_EARNED_DANGER_GATE_TUNING
- PASS: baseline is 6N - EARNED_DANGER_GATE_6N
- PASS: batch 50 matches exists - matchCount: 50
- PASS: earned danger gate rows observed - observedGateRowCount: 550
- PASS: earned danger reintroduced - earnedDangerRateAfter: 99.8%
- PASS: borderline danger measured - borderlineDangerRateAfter: 0.2%
- PASS: automatic danger remains filtered - automaticDangerSuspicionRateAfter: 0%
- PASS: gate is not too strict without warning - gateTooStrictSuspicionCountAfter: 0
- PASS: gate is not too loose without warning - gateTooLooseSuspicionCountAfter: 0
- PASS: root cause audit has no contradiction - rootCauseContradictionCount: 0
- PASS: density calibration preserved or status partial - 12.6/28.1
- PASS: route family mix preserved - TRY/DROP/CONVERSION/CONTINUATION present
- PASS: team opportunity balance preserved or status partial - team balance checked
- PASS: goalkeeper secure reset preserved or status partial - true
- PASS: post-score reset preserved or status partial - false
- PASS: dominance chains preserved or status partial - false
- PASS: score from score_change - official score source
- PASS: official path connected all runs - official path connected
- PASS: calibration applied all runs - 6O seeds connected
- PASS: scoring constants unchanged - SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive
- PASS: no score cap - scoreCapApplied false
- PASS: no post-hoc rewrite - postHocRewriteApplied false
- PASS: no event deletion - scoringEventsDeleted false
- PASS: no forced score - forced scores false
- PASS: MatchBonusEvent unchanged - MatchBonusEvent false
- PASS: batch/live separation preserved - batch/live true
- PASS: no UNKNOWN scoring family - unknownScoringFamilyCount: 0
- PASS: no PENALTY_SHOT leakage - penaltyShotActiveLeakageCount: 0
- PASS: PASS/PARTIAL/FAIL justified - PARTIAL

## Explicit Exhaustive Test Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`
