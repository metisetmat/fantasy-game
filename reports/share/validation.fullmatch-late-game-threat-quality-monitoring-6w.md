# Validation - Full-Match Late Game Threat Quality Monitoring 6W

Status: PASS

## Required Command
`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`

## Checks
- PASS: late game threat quality monitoring model exists - FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING
- PASS: baseline 6V metrics visible - LATE_GAME_THREAT_QUALITY_6V
- PASS: batch 50 matches after monitoring exists - 50
- PASS: score from score_change all runs - true
- PASS: official path connected all runs - true
- PASS: scoring constants unchanged - false
- PASS: MatchBonusEvent unchanged - false
- PASS: no cap/rewrite/delete/forced score - guardrails false
- PASS: no forced trailing score - trailing score guards false
- PASS: no rubber-banding or forced comeback - no comeback
- PASS: no leading score suppression - false
- PASS: no trailing opportunity forced - false
- PASS: no UNKNOWN - 0
- PASS: PENALTY_SHOT inactive - 0
- PASS: no persistence/SQLite scoring - false/false
- PASS: route family diversity preserved - true
- PASS: TRY/DROP still present - TRY and DROP present
- PASS: CONTINUATION still present - continuation present
- PASS: gate selectivity preserved - true
- PASS: automatic danger remains low - true
- PASS: dominance chain max stays <= 4 - 2
- PASS: chain metric consistency stays true - true
- PASS: calibration coverage complete - true
- PASS: lateGameThreatQualityRate explained or reduced from 100% - 100%
- PASS: lateGameAutomaticThreatRate low - 0%
- PASS: lateGameThreatWithoutSignalRate low - 0%
- PASS: forced comeback suspicion explained or reduced - 230/230
- PASS: forced comeback unexplained count low - 0
- PASS: natural trailing conversion path audit exists - 127
- PASS: trailing scoring path complete - 127/127
- PASS: closeGameRate preserved - 50%
- PASS: competitiveGameRate preserved - 78%
- PASS: blowout/severe blowout preserved - 14% / 0%
- PASS: averageTotalPoints remains healthy - 22.2
- PASS: scoringEventsPerMatch remains healthy - 7.2
- PASS: scoringOpportunitiesPerMatch remains healthy - 16.3
- PASS: no contradictory healthy warning if automaticity remains high - FULL_MATCH_BATCH_ECONOMY_HEALTHY, LATE_GAME_THREAT_MONITORING_COMPLETE, LATE_GAME_THREAT_AUTOMATICITY_MEASURED, LATE_GAME_THREAT_AUTOMATICITY_REDUCED, LATE_GAME_THREAT_AUTOMATICITY_EXPLAINED, LATE_GAME_THREAT_FROM_REAL_SIGNAL_CONFIRMED, FORCED_COMEBACK_SUSPICION_MEASURED, FORCED_COMEBACK_SUSPICION_EXPLAINED, FORCED_COMEBACK_FALSE_POSITIVES_CLASSIFIED, NATURAL_TRAILING_CONVERSION_PATH_MEASURED, NATURAL_TRAILING_CONVERSION_PATH_COMPLETE, NO_ACTUAL_FORCED_COMEBACK_CONFIRMED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED, CLOSE_GAME_RATE_PRESERVED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, GATE_SELECTIVITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE

## Counts
- lateGamePressureCountAfter: 51
- lateGameThreatCountAfter: 51
- lateGameThreatQualityRateAfter: 100
- lateGameAutomaticThreatRateAfter: 0
- lateGameThreatWithoutSignalRateAfter: 0
- lateGameThreatFromRealSignalRateAfter: 100
- forcedComebackSuspicionCountAfter: 230
- forcedComebackSuspicionExplainedCountAfter: 230
- forcedComebackSuspicionUnexplainedCountAfter: 0
- naturalTrailingScoringEventCountAfter: 127
- trailingScoringPathCompleteCountAfter: 127
- trailingScoringPathIncompleteCountAfter: 0
- closeGameRateAfter: 50
- competitiveGameRateAfter: 78
- blowoutRateAfter: 14
- severeBlowoutRateAfter: 0
- warnings: FULL_MATCH_BATCH_ECONOMY_HEALTHY, LATE_GAME_THREAT_MONITORING_COMPLETE, LATE_GAME_THREAT_AUTOMATICITY_MEASURED, LATE_GAME_THREAT_AUTOMATICITY_REDUCED, LATE_GAME_THREAT_AUTOMATICITY_EXPLAINED, LATE_GAME_THREAT_FROM_REAL_SIGNAL_CONFIRMED, FORCED_COMEBACK_SUSPICION_MEASURED, FORCED_COMEBACK_SUSPICION_EXPLAINED, FORCED_COMEBACK_FALSE_POSITIVES_CLASSIFIED, NATURAL_TRAILING_CONVERSION_PATH_MEASURED, NATURAL_TRAILING_CONVERSION_PATH_COMPLETE, NO_ACTUAL_FORCED_COMEBACK_CONFIRMED, NO_RUBBER_BANDING_CONFIRMED, NO_FORCED_COMEBACK_CONFIRMED, NO_TRAILING_SCORE_INJECTION_CONFIRMED, NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED, NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED, CLOSE_GAME_RATE_PRESERVED, COMPETITIVE_GAME_RATE_PRESERVED, BLOWOUT_RATE_PRESERVED, SEVERE_BLOWOUT_STILL_LOW, ROUTE_FAMILY_DIVERSITY_PRESERVED, GATE_SELECTIVITY_PRESERVED, CALIBRATION_COVERAGE_COMPLETE