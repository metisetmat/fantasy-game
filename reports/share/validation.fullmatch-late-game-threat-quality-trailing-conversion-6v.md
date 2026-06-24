# Validation - Full-Match Late Game Threat Quality & Trailing Conversion 6V

Status: PASS

## Required Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`

## Checks
- PASS: late game threat quality trailing conversion model exists - FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION
- PASS: baseline 6U metrics visible - TRAILING_TEAM_RESPONSE_6U
- PASS: batch 50 matches after calibration exists - matchCount 50
- PASS: unique seeds measured - 50
- PASS: score from score_change all runs - true
- PASS: official path connected all runs - true
- PASS: scoring constants unchanged - false
- PASS: MatchBonusEvent unchanged - false
- PASS: no cap - false
- PASS: no post-hoc rewrite - false
- PASS: no event deletion - false
- PASS: no forced score - false
- PASS: no forced trailing team score - false
- PASS: no rubber-banding - false
- PASS: no forced comeback - false
- PASS: no leading team score suppression - false
- PASS: no trailing team opportunity forced - false
- PASS: no trailing team score change injected - false
- PASS: no UNKNOWN - 0
- PASS: PENALTY_SHOT inactive - 0
- PASS: no persistence/SQLite scoring - false/false
- PASS: route family diversity preserved - true
- PASS: gate selectivity preserved - true
- PASS: automatic danger remains blocked - true
- PASS: calibration coverage complete - true
- PASS: trailing threat quality measured - 354
- PASS: trailing threat quality improved or explicitly partial - 52.5%
- PASS: territorial gain restored - 2%
- PASS: forced defensive action restored - 2%
- PASS: half chance measured - 2.5%
- PASS: earned danger measured - 12.7%
- PASS: natural trailing conversion measured - 106
- PASS: trailing score share natural or explicitly partial - 36%
- PASS: late game threat quality measured - 973
- PASS: closeGameRate recovered or explicitly partial - 56%
- PASS: competitiveGameRate preserved - 76%
- PASS: blowout/severe blowout preserved - 8% / 0%
- PASS: no contradictory healthy warning - FULL_MATCH_BATCH_ECONOMY_HEALTHY, LATE_GAME_THREAT_QUALITY_FOLLOWUP_COMPLETE, TRAILING_THREAT_QUALITY_MEASURED, NATURAL_TRAILING_CONVERSION_MEASURED, LATE_GAME_THREAT_QUALITY_MEASURED, TRAILING_THREAT_QUALITY_IMPROVED, TRAILING_TERRITORIAL_GAIN_RESTORED, TRAILING_FORCED_DEFENSIVE_ACTION_RESTORED, TRAILING_EARNED_DANGER_IMPROVED, TRAILING_SCORING_SHARE_RESTORED_NATURALLY, LATE_GAME_THREAT_QUALITY_IMPROVED, CLOSE_GAME_RATE_RECOVERED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, GATE_SELECTIVITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED
- PASS: PASS/PARTIAL/FAIL justified - PASS

## Counts
- trailingThreatWindowCount: 354
- trailingThreatQualityRateAfter: 52.5
- trailingThreatConversionRateAfter: 63.4
- trailingTeamScoringShareAfter: 36
- trailingTeamTerritorialGainRateAfter: 2
- trailingTeamForcedDefensiveActionRateAfter: 2
- trailingTeamHalfChanceRateAfter: 2.5
- trailingTeamEarnedDangerRateAfter: 12.7
- lateGameThreatQualityRateAfter: 100
- closeGameRateAfter: 56
- competitiveGameRateAfter: 76
- blowoutRateAfter: 8
- severeBlowoutRateAfter: 0
- warnings: FULL_MATCH_BATCH_ECONOMY_HEALTHY, LATE_GAME_THREAT_QUALITY_FOLLOWUP_COMPLETE, TRAILING_THREAT_QUALITY_MEASURED, NATURAL_TRAILING_CONVERSION_MEASURED, LATE_GAME_THREAT_QUALITY_MEASURED, TRAILING_THREAT_QUALITY_IMPROVED, TRAILING_TERRITORIAL_GAIN_RESTORED, TRAILING_FORCED_DEFENSIVE_ACTION_RESTORED, TRAILING_EARNED_DANGER_IMPROVED, TRAILING_SCORING_SHARE_RESTORED_NATURALLY, LATE_GAME_THREAT_QUALITY_IMPROVED, CLOSE_GAME_RATE_RECOVERED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, GATE_SELECTIVITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED