# Validation - Full-Match Earned Danger Gate 6N

Status: PASS

## Counts
- matchCount: 50
- blowoutRateAfter: 42%
- closeGameRateAfter: 32%
- competitiveGameRateAfter: 64%
- resetToImmediateDangerRateAfter: 0%
- automaticDangerSuspicionRateAfter: 0%
- earnedDangerRateAfter: 0%
- unknownScoringFamilyCount: 0
- penaltyShotActiveLeakageCount: 0

## Checks
- PASS: Earned Danger Gate model exists - FULL_MATCH_EARNED_DANGER_GATE_CALIBRATION
- PASS: baseline 6M metrics visible - RESET_BREAK_BLOWOUT_ECONOMY_6M 46%
- PASS: batch 50 matches after calibration exists - matchCount: 50
- PASS: blowout economy audit exists - audits: 50
- PASS: reset-to-danger quality audit exists - audits: 50
- PASS: earned danger gate audit exists - audits: 50
- PASS: blowoutRate measured - 42%
- PASS: blowoutRate decreases versus 6M or failure justified - 46% -> 42%
- PASS: closeGameRate measured - 32%
- PASS: competitiveGameRate measured - 64%
- PASS: resetToImmediateDangerRate measured - 0%
- PASS: resetToImmediateDangerRate reduced or explained - 87.4% -> 0%
- PASS: earnedDangerRate measured - 0%
- PASS: automaticDangerSuspicionRate measured - 0%
- PASS: earnedDangerRate increases or failure justified - 6.8% -> 0%
- PASS: automaticDangerSuspicionRate reduced or explained - 93.2% -> 0%
- PASS: gate decision distribution measured - decisions: 3
- PASS: gate reason code distribution measured - reasons: 13
- PASS: dangerBlockedByGateRate measured - 2%
- PASS: dangerDowngradedToNeutralRate measured - 12%
- PASS: dangerDowngradedToSafePossessionRate measured - 86%
- PASS: resetToDangerWithoutSupport decreases or failure justified - 50 -> 0
- PASS: resetToDangerWithoutTacticalEdge decreases or failure justified - 50 -> 0
- PASS: resetToDangerWithoutAttributeEdge decreases or failure justified - 49 -> 0
- PASS: resetToDangerDespiteGoalkeeperSecure decreases or failure justified - 45 -> 0
- PASS: goalkeeper secure gains preserved or explained - 100% / 100%
- PASS: post-score reset gains preserved or explained - 22.9% / 69.8%
- PASS: dominance chain gains preserved or explained - 2
- PASS: density calibration preserved - 9.7/20.5
- PASS: team opportunity balance preserved - 82/82
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
