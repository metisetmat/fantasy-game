# Validation - Full-Match Reset Break Blowout Economy 6M

Status: PASS

## Counts
- matchCount: 50
- blowoutRateAfter: 46%
- closeGameRateAfter: 28%
- competitiveGameRateAfter: 62%
- resetToImmediateDangerRateAfter: 87.4%
- automaticDangerSuspicionRateAfter: 93.2%
- earnedDangerRateAfter: 6.8%
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Checks
- PASS: reset break blowout economy model exists - FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION
- PASS: baseline 6L metrics visible - GOALKEEPER_SECURE_RESET_BREAK_6L 48%
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: blowout economy audit exists - audits: 50
- PASS: reset-to-danger quality audit exists - audits: 50
- PASS: blowoutRate measured - 46%
- PASS: blowoutRate decreases versus 6L or failure justified - 48% -> 46%
- PASS: closeGameRate measured - 28%
- PASS: competitiveGameRate measured - 62%
- PASS: resetToImmediateDangerRate measured - 87.4%
- PASS: resetToImmediateDangerRate reduced or explained - 60.5% -> 87.4%
- PASS: earnedDangerRate measured - 6.8%
- PASS: automaticDangerSuspicionRate measured - 93.2%
- PASS: automaticDangerSuspicionRate reduced or classified - 30% -> 93.2%
- PASS: goalkeeper secure gains preserved - 100% / 100%
- PASS: post-score reset gains preserved - 15.9% / 78.5%
- PASS: dominance chain gains preserved - 2
- PASS: density calibration preserved - 7.2/16
- PASS: team opportunity balance preserved - 76/81
- PASS: route family diversity preserved - TRY/DROP/CONVERSION/CONTINUATION present
- PASS: TRY route remains available - TRY present
- PASS: DROP route remains available - DROP present
- PASS: CONVERSION only after TRY - conversion bounded by try
- PASS: CONTINUATION remains available - continuation present
- PASS: score from score_change - official score source
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
- PASS: PASS/PARTIAL/FAIL justified - PARTIAL

## Explicit Exhaustive Test Command
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
