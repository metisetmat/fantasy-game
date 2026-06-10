import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeContinuationPayoffCalibration } from "./continuationPayoffCalibration";
import { summarizeDangerPhaseConversionEconomy } from "./dangerPhaseConversionEconomy";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizeFullMatchEconomyValidation } from "./fullMatchEconomyValidation";
import { summarizeMatchDurationPossessionVolumeCalibration } from "./matchDurationPossessionVolumeCalibration";
import { summarizePostResolutionRouteEconomyMonitoring } from "./postResolutionRouteEconomyMonitoring";
import { summarizeRouteSuccessRateCalibration } from "./routeSuccessRateCalibration";
import { isHalfSpaceOriginZone, summarizeShotOriginHeatmap } from "./shotOriginHeatmap";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

function routePointRows(summary: ReturnType<typeof summarizePostResolutionRouteEconomyMonitoring>): readonly string[] {
  return summary.routePointShares.map(
    (row) => `| ${row.route} | ${row.points} | ${row.pointShare}% | ${row.eventsOrSelections} | ${row.tacticalRead} |`,
  );
}

function fullMatchRoutePointRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  return summary.routePointShares.map(
    (row) => `| ${row.route} | ${row.points} | ${row.pointShare}% | ${row.eventsOrSelections} | ${row.tacticalRead} |`,
  );
}

function routeToShotPipelineRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  return summary.routeToShotPipelineRows.map(
    (row) =>
      `| ${row.sourceChain} | ${row.shotAttempts} | ${row.shotGoals} | ${row.shotGoalPoints} | ${row.averageXG}% | ${row.conversionRate}% | ${row.tacticalRead} |`,
  );
}

function continuationToShotRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  return summary.continuationToShotAuditRows.map(
    (row) =>
      `| ${row.continuationFamily} | ${row.selectedCount} | ${row.laterShotAttemptsGenerated} | ${row.laterShotGoalsGenerated} | ${row.laterTryAttemptsGenerated} | ${row.laterDropAttemptsGenerated} | ${row.classification} |`,
  );
}

function reboundContributionRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  return summary.reboundContributionRows.map(
    (row) =>
      `| ${row.reboundAttempts} | ${row.reboundGoals} | ${row.reboundShareOfShotGoals}% | ${row.centralReboundShare}% | ${row.tapInCount} | ${row.desperateSecondShotCount} | ${row.xGDistribution} | ${row.tacticalRead} |`,
  );
}

function beforeAfterReboundRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  const after = summary.reboundContributionRows[0];

  return [
    "| before sprint baseline | 100 | 14 | 48% | 82% | 22 | 46 | current brief baseline before rebound calibration |",
    `| after rebound calibration | ${after?.reboundAttempts ?? 0} | ${after?.reboundGoals ?? 0} | ${after?.reboundShareOfShotGoals ?? 0}% | ${after?.centralReboundShare ?? 0}% | ${after?.tapInCount ?? 0} | ${after?.desperateSecondShotCount ?? 0} | ${after?.tacticalRead ?? "rebound calibration active"} |`,
  ];
}

function halfSpaceEconomyRows(summary: ReturnType<typeof summarizeShotOriginHeatmap>): readonly string[] {
  const halfSpaceRows = summary.records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const cleanRows = halfSpaceRows.filter((record) => record.cleanWindowType === "CLEAN");
  const forcedRows = halfSpaceRows.filter((record) => record.cleanWindowType === "FORCED");
  const reboundRows = halfSpaceRows.filter((record) => record.routeFamily === "rebound / second shot");
  const rowFor = (label: string, rows: typeof halfSpaceRows, read: string): string =>
    `| ${label} | ${rows.length} | ${rows.filter((record) => record.goal === "YES").length} | ${Math.round((rows.filter((record) => record.onTarget === "YES").length / Math.max(1, rows.length)) * 100)}% | ${Math.round((rows.filter((record) => record.goal === "YES").length / Math.max(1, rows.length)) * 100)}% | ${Math.round(rows.reduce((sum, record) => sum + record.finalXG, 0) / Math.max(1, rows.length))}% | ${read} |`;

  return [
    "| before sprint baseline | 126 | 5 | not captured | 4% | 3% | baseline from brief showed several half-space zones at 0 goals and 2-4% xG. |",
    rowFor("after all half-space", halfSpaceRows, "half-space viability is calibrated locally, not globally buffed."),
    rowFor("after clean half-space", cleanRows, "clean angled windows are now viable when earned."),
    rowFor("after forced half-space", forcedRows, "forced half-space remains low quality."),
    rowFor("after rebound half-space", reboundRows, "rebound half-space depends on body balance and recovery."),
  ];
}

function nonShotAttritionRows(summary: ReturnType<typeof summarizeFullMatchEconomyValidation>): readonly string[] {
  return summary.nonShotRouteAttritionRows.map(
    (row) =>
      `| ${row.route} | ${row.selectedCount} | ${row.attemptsExecuted} | ${row.successfulScores} | ${row.failedOutcomes} | ${row.primaryFailureReasons} | ${row.valueAttrition}% | ${row.tacticalRead} |`,
  );
}

function tryAttritionSnapshotRows(routeSuccess: ReturnType<typeof summarizeRouteSuccessRateCalibration>): readonly string[] {
  const lostForward = routeSuccess.tryRows.filter((row) => row.outcome === "LOST_FORWARD").length;
  const heldUp = routeSuccess.tryRows.filter((row) => row.outcome === "HELD_UP").length;
  const tackledShort = routeSuccess.tryRows.filter((row) => row.outcome === "TACKLED_SHORT").length;

  return [
    "| before try attrition calibration | 22 | 5 | 23% | 13 | 2 | 2 | 3 | 25 | 6 | baseline from sprint brief. |",
    `| after try attrition calibration | ${routeSuccess.tryAttempts} | ${routeSuccess.triesScored} | ${routeSuccess.trySuccessRate}% | ${lostForward} | ${heldUp} | ${tackledShort} | ${routeSuccess.conversionsMade} | ${routeSuccess.triesScored * TRY_TOUCHDOWN_POINT_VALUE} | ${routeSuccess.conversionsMade * CONVERSION_POINT_VALUE} | high-quality legal access is rewarded without changing point values. |`,
  ];
}

function sterileRows(summary: ReturnType<typeof summarizeDangerPhaseConversionEconomy>): readonly string[] {
  return summary.sterileDangerRows
    .slice(0, 16)
    .map(
      (row) =>
        `| ${row.matchId} | ${row.pressureProfile} | ${row.styleProfile} | ${row.selectedRoute} | ${row.bestRejectedScoringRoute} | ${row.routeQuality} | ${row.sterileCause} | ${row.coachRead} |`,
    );
}

function continuationRows(summary: ReturnType<typeof summarizeContinuationPayoffCalibration>): readonly string[] {
  return summary.taxonomyRows.map(
    (row) =>
      `| ${row.continuationType} | ${row.taxonomy} | ${row.selectedCount} | ${row.calibratedPayoffRate}% | ${row.tacticalRead} |`,
  );
}

export function createRouteEconomyMonitoringReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const postResolution = summarizePostResolutionRouteEconomyMonitoring(input);
  const danger = summarizeDangerPhaseConversionEconomy(input);
  const continuation = summarizeContinuationPayoffCalibration(input);
  const matchVolume = summarizeMatchDurationPossessionVolumeCalibration(input);
  const fullMatch = summarizeFullMatchEconomyValidation(input);
  const heatmap = summarizeShotOriginHeatmap(input.batchCalibration);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const tryAttritionRecommendations = [
    "KEEP_SCORING_VALUES",
    "CALIBRATE_TRY_ATTRITION",
    "REVIEW_LOST_FORWARD_OVERPUNISHMENT",
    "REWARD_HIGH_QUALITY_LEGAL_ACCESS",
    "PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
    "PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT",
    "MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION",
    "MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION",
    "REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
    "PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY",
    "CONFIRM_PLAYER_LOAD_BALANCING_IF_HEALTHY",
    "MONITOR_SPECIALIST_DEPENDENCY_COST",
    "MONITOR_BENCH_DEPTH_COST",
    "REVIEW_GK_MENTAL_LOAD_COST",
    "PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT",
    "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION",
  ] as const;

  return [
    "# Route Economy Monitoring",
    "",
    "## Summary",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- SHOT_GOAL remains 3 match points",
    `- TRY_TOUCHDOWN remains ${TRY_TOUCHDOWN_POINT_VALUE} match points`,
    `- CONVERSION_GOAL remains ${CONVERSION_POINT_VALUE} match points`,
    `- DROP_GOAL remains ${DROP_GOAL_POINT_VALUE} match points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- no global shot nerf applied",
    "- no global try buff applied",
    "- no global drop buff applied",
    "- no global route success buff applied",
    `- matches simulated: ${postResolution.matchesSimulated}`,
    `- average total points: ${postResolution.scorelineHealth.averageTotalPoints}`,
    `- 0-0 draw rate: ${postResolution.scorelineHealth.nilNilDrawRate}%`,
    `- sterile danger phases: ${danger.sterileDangerPhaseCount}`,
    `- sterile danger rate: ${danger.sterileDangerRate}%`,
    `- danger-to-score conversion rate: ${danger.dangerToScoreConversionRate}%`,
    `- projected sterile danger rate after continuation payoff calibration: ${continuation.projectedSterileDangerRate}%`,
    `- projected 0-0 draw rate after full-match volume calibration: ${matchVolume.scorelineHealth.nilNilDrawRate}%`,
    `- observed 0-0 draw rate in full-match economy validation: ${fullMatch.scorelineHealth.nilNilDrawRate}%`,
    `- calibrated offensive possessions per match: ${matchVolume.possessionVolume.calibratedOffensivePossessionsPerMatch}`,
    `- calibrated danger phases per match: ${matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch}`,
    `- full-match average total points: ${fullMatch.scorelineHealth.averageTotalPoints}`,
    `- full-match unique final scores: ${fullMatch.scorelineHealth.uniqueFinalScores}`,
    "- bonus readiness audit: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE",
    "- bonus scope: league-table MatchBonusEvent active after final whistle, not live match score",
    "- implemented bonus value: +1 league point per trigger, capped at +2 per team-match",
    "- league points simulation: proposed WIN 4 / DRAW 2 / LOSS 0 / FORFEIT -1 tested as diagnostics only",
    "- bonus trigger implementation: 3+ tries, 3 main scoring families with CONVERSION excluded, close-loss <=7, and major-threat shutdown audited in full-match-economy-validation.md",
    `- MatchBonusEvents generated: ${fullMatch.matchBonusSummary.totalMatchBonusEvents}; cap activations ${fullMatch.matchBonusSummary.capActivationCount}`,
    `- league table integration: generated from LeaguePointsSummary; team-table reconciliation ${fullMatch.leagueTableIntegration.matchPointsEqualTablePoints}`,
    `- fatigue bonus correlation instrumentation: ${fullMatch.leagueTableIntegration.fatigueInstrumentationAvailable === "YES" ? "AVAILABLE" : "NOT_AVAILABLE"}; lateMatchWindow ${fullMatch.leagueTableIntegration.lateMatchWindow}`,
    "- fatigue/load/roster instrumentation: PlayerFatigueTimelineRow, TeamFatigueTimelineRow, TeamMatchFatigueSummary, PlayerMatchLoadSummary, TeamLoadSummary, LateMatchPerformanceSummary, and RosterQualitySummary are populated with V1 real values",
    "- roster stress test: active in full-match-economy-validation.md; controlled weak-build variants are diagnostic-only and do not change scoring values, MatchBonusEvent rules, or production rosters",
    "- player load balancing: active; specialist dependency, bench depth, role-specific load, GK mental load, and style-load interaction are audited in full-match-economy-validation.md without changing scoring values",
    "- role economy balancing: active; role taxonomy, attribute mapping, role usage, omission, redundancy, archetype viability, and mandatory-role risk are audited in full-match-economy-validation.md and coach-role-guide.md",
    "- fatigue bonus audit recommendation: REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE; keep MatchBonusEvent league-table-only",
    "- route point share source: recomputed from active post-geometry outcomes",
    `- route point mismatch count: ${fullMatch.routePointMismatchCount}`,
    `- try attrition calibration: TRY ${routeSuccess.trySuccessRate}%, LOST_FORWARD ${routeSuccess.tryRows.filter((row) => row.outcome === "LOST_FORWARD").length}, HELD_UP ${routeSuccess.tryRows.filter((row) => row.outcome === "HELD_UP").length}, TACKLED_SHORT ${routeSuccess.tryRows.filter((row) => row.outcome === "TACKLED_SHORT").length}`,
    `- meta-risks: ${[...new Set([...postResolution.metaRisks, ...danger.metaRisks])].join(", ") || "none"}`,
    `- recommendations: ${tryAttritionRecommendations.join(", ")}`,
    "",
    "## Route Point Share Monitoring",
    "- legacy post-resolution route economy table kept for historical comparison only.",
    "",
    "| route | points | point share | events/selections | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...routePointRows(postResolution),
    "",
    "## Recomputed Post-Geometry Route Point Share",
    "- source: full-match-economy-validation.md recomputed route point share.",
    "- point formula: SHOT_GOAL goals * 3, TRY_TOUCHDOWN tries * 5, CONVERSION_GOAL made * 2, DROP_GOAL made * 2.",
    "",
    "| route | points | point share | events/selections | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...fullMatchRoutePointRows(fullMatch),
    "",
    "## Route Point Share Integrity",
    `- route point mismatch count: ${fullMatch.routePointMismatchCount}`,
    `- scoreline mismatch count: ${fullMatch.scorelineMismatchCount}`,
    `- stale route mix count: ${fullMatch.staleRouteMixCount}`,
    `- scoring event mismatch count: ${fullMatch.scoringEventMismatchCount}`,
    "- stale metric detection: old route point share used a different population; recomputed route point share is now the current diagnostic source.",
    "",
    "## Shot Volume & Route-to-Shot Pipeline Audit",
    "- route point share remains recomputed from active post-geometry outcomes.",
    "- no stale route point share is used as the current diagnostic.",
    "",
    "| source chain | shot attempts | shot goals | SHOT_GOAL points | average xG | conversion | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...routeToShotPipelineRows(fullMatch),
    "",
    "## Continuation-to-Shot Audit",
    "",
    "| continuation family | selected count | later shot attempts | later shot goals | later try attempts | later drop attempts | classification |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...continuationToShotRows(fullMatch),
    "",
    "## Rebound Contribution Table",
    "",
    "| rebound attempts | rebound goals | share of shot goals | central rebound share | tap-in count | desperate second shots | xG distribution | tactical read |",
    "| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...reboundContributionRows(fullMatch),
    "",
    "## Before/After Rebound Contribution Table",
    "",
    "| state | rebound attempts | rebound goals | share of shot goals | central rebound share | tap-in count | desperate second shots | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...beforeAfterReboundRows(fullMatch),
    "",
    "## Rebound Economy Calibration Audit",
    "- rebound source decomposition table present in full-match-economy-validation.md.",
    "- central rebound audit present in full-match-economy-validation.md.",
    "- GK rebound handling audit present in full-match-economy-validation.md.",
    "- defender recovery audit present in full-match-economy-validation.md.",
    "- second-shot quality audit present in full-match-economy-validation.md.",
    "",
    "## Half-Space Shot Context Calibration",
    "- half-space population audit, classification table, modifier audit, same-distance central comparison, and before/after metrics are expanded in full-match-economy-validation.md and shot-origin-heatmap.md.",
    "- clean true half-space windows get targeted viability; forced, narrow, and desperate half-space shots stay difficult.",
    "",
    "| state | attempts | goals | on-target rate | conversion | average xG | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceEconomyRows(heatmap),
    "",
    "## Non-Shot Route Attrition",
    "",
    "| route | selected count | attempts executed | successful scores | failed outcomes | primary failure reasons | value attrition | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |",
    ...nonShotAttritionRows(fullMatch),
    "",
    "## Try Attrition Calibration",
    "- legal, high-quality try access is rewarded more fairly; marginal access, poor support, and goal-line pressure still fail.",
    "- detailed population, LOST_FORWARD, legal access, and access route audits are expanded in full-match-economy-validation.md.",
    "",
    "| state | attempts | tries | try success | LOST_FORWARD | HELD_UP | TACKLED_SHORT | conversions made | try points | conversion points | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...tryAttritionSnapshotRows(routeSuccess),
    "",
    "## Try Attrition Guardrails",
    "- no global try buff applied.",
    "- no forced scoring events.",
    "- no central/frontal try path introduced.",
    "- no illegal Z0/Z8 off-ball occupancy.",
    "- conversion scoring remains linked to scored tries only.",
    "",
    "## Scoreline Health",
    `- average total points: ${postResolution.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${postResolution.scorelineHealth.medianTotalPoints}`,
    `- 0-0 draw rate: ${postResolution.scorelineHealth.nilNilDrawRate}%`,
    `- scoring draw rate: ${postResolution.scorelineHealth.scoringDrawRate}%`,
    `- one-score game rate: ${postResolution.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${postResolution.scorelineHealth.blowoutRate}%`,
    `- unique final scores: ${postResolution.scorelineHealth.uniqueFinalScores}`,
    "",
    "## Route Diversity",
    `- matches with SHOT-only scoring: ${postResolution.routeDiversity.matchesWithShotOnlyScoring}`,
    `- matches with TRY involved: ${postResolution.routeDiversity.matchesWithTryInvolved}`,
    `- matches with DROP involved: ${postResolution.routeDiversity.matchesWithDropInvolved}`,
    `- matches with mixed route scoring: ${postResolution.routeDiversity.matchesWithMixedRouteScoring}`,
    `- matches with no scoring despite danger phases: ${postResolution.routeDiversity.matchesWithNoScoringDespiteDangerPhases}`,
    "",
    "## Bonus Readiness Summary",
    "- bonus readiness audit: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE",
    "- bonus implementation status: MATCH_BONUS_EVENT_ACTIVE_POST_FINAL_WHISTLE",
    "- offensive V1 model: +1 league point for 3+ TRY_TOUCHDOWN; +1 for scoring through SHOT_GOAL + TRY_TOUCHDOWN + DROP_GOAL.",
    "- defensive V1 model: +1 league point for close loss by <=7 points; +1 for zero SHOT_GOAL and zero TRY_TOUCHDOWN conceded.",
    "- bonus source of truth: separate MatchBonusEvent records; do not add bonuses to SHOT_GOAL / TRY_TOUCHDOWN / CONVERSION_GOAL / DROP_GOAL ScoringEvents.",
    "- conversion exclusion: CONVERSION_GOAL excluded from route-family bonus.",
    "- cap: max +2 bonus league points per team-match.",
    "- risk guardrail: do not use bonuses to mask route imbalance, try attrition, rebound economy, or SHOT_GOAL point share.",
    "- implementation gate: prepare league-table aggregation next; match score remains unchanged.",
    `- league-table integration status: ${fullMatch.leagueTableIntegration.matchPointsEqualTablePoints === "YES" ? "PASS" : "WATCH"}.`,
    `- fatigue-to-bonus correlation status: ${fullMatch.leagueTableIntegration.fatigueInstrumentationAvailable === "YES" ? "AVAILABLE" : "NOT_AVAILABLE"}.`,
    "",
    "## League Points & Bonus Trigger Simulation Summary",
    "- proposed league table: WIN 4, DRAW 2, LOSS 0, FORFEIT -1.",
    "- proposed offensive bonuses tested: +1 for 4+ TRY_TOUCHDOWN; +2 for 3+ scoring families.",
    "- proposed defensive bonuses tested: +1 close-loss under 10; +1 no-goal/no-try with OR, AND, and major-threat wording compared.",
    "- stacking cap models tested: no cap, max +2, max +3, max +4.",
    "- refined route-family adjustment: compare conversion-included four-family model against conversion-excluded three-main-family model.",
    "- refined try threshold adjustment: compare 3+ TRY_TOUCHDOWN against 4+ TRY_TOUCHDOWN.",
    "- preferred simulation adjustment: exclude CONVERSION_GOAL from route-family bonus unless explicitly selected by final rule; test 3 main families as +1 and cap total bonuses at +2 before implementation.",
    "- preferred defensive wording: close-loss <=7 plus AND / major-threat version, not OR.",
    "- fatigue/team-construction proxy audit: RosterQualitySummary V1 and roster stress tests are available before any fatigue-sensitive bonus tuning.",
    "- implementation status: MatchBonusEvent exists as a league-table-only post-match layer.",
    "",
    "## Sterile Danger Phase Decomposition",
    "",
    "| match | pressure | style profile | selected route | best rejected scoring route | route quality | sterile cause | coach read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sterileRows(danger),
    "",
    "## Continuation Route Payoff",
    "",
    "| continuation type | taxonomy | selected count | calibrated payoff rate | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...continuationRows(continuation),
    "",
    "## Style Impact",
    "",
    "| style profile | matches | points per match | conversion rate | clean-window conversion | win contribution | draw contribution | route economy read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...postResolution.styleImpact.map(
      (row) =>
        `| ${row.styleProfile} | ${row.matches} | ${row.pointsPerMatch} | ${row.conversionRate}% | ${row.cleanWindowConversionRate}% | ${row.winContribution}% | ${row.drawContribution}% | ${row.routeEconomyRead} |`,
    ),
    "",
    "## Current Economy Recommendations",
    "- KEEP_SCORING_VALUES",
    "- KEEP_ROUTE_RESOLUTION_CALIBRATIONS",
    "- MONITOR_ROUTE_POINT_SHARE",
    "- REVIEW_STERILE_DANGER_PHASES",
    "- REVIEW_0_0_DRAW_RATE",
    "- IMPROVE_CONTINUATION_PAYOFF",
    "- CALIBRATE_TRY_ATTRITION",
    "- REVIEW_LOST_FORWARD_OVERPUNISHMENT",
    "- REWARD_HIGH_QUALITY_LEGAL_ACCESS",
    "- PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
    "- PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT",
    "- MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION",
    "- MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION",
    "- REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
    "- BONUS_DESIGN_READY",
    "- KEEP_BONUSES_OUT_OF_MATCH_SCORE",
    "- KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY",
    "- USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE",
    "- CONFIRM_LEAGUE_TABLE_INTEGRATION",
    "- CONFIRM_LEAGUE_POINTS_SUMMARY",
    "- RECOMMEND_OFFENSIVE_BONUS_MODEL",
    "- RECOMMEND_DEFENSIVE_BONUS_MODEL",
    "- VALIDATE_BONUS_TRIGGER_RATE_BEFORE_IMPLEMENTATION",
    "- DO_NOT_USE_BONUSES_TO_MASK_ROUTE_IMBALANCE",
    "- PREPARE_BONUS_IMPLEMENTATION_SPRINT_AFTER_AUDIT",
    "- VALIDATE_4_2_0_MINUS_1_TABLE",
    "- SIMULATE_BONUS_TRIGGER_RATES",
    "- REVIEW_3_SCORING_FAMILIES_BONUS_VALUE",
    "- REVIEW_CLOSE_LOSS_THRESHOLD",
    "- REVIEW_NO_GOAL_NO_TRY_OR_VS_AND",
    "- REVIEW_BONUS_STACKING_CAP",
    "- KEEP_BONUSES_OUT_OF_LIVE_SCORE",
    "- USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE",
    "- PREPARE_LEAGUE_TABLE_INTEGRATION",
    "- EXCLUDE_CONVERSION_FROM_ROUTE_FAMILY_BONUS_IF_CONFIRMED",
    "- CONFIRM_3_TRY_OFFENSIVE_BONUS",
    "- CONFIRM_3_MAIN_SCORING_FAMILIES_BONUS",
    "- CONFIRM_CLOSE_LOSS_7_POINTS",
    "- CONFIRM_MAJOR_THREAT_DEFENSIVE_BONUS",
    "- CONFIRM_BONUS_CAP_PLUS_2",
    "- CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES",
    "- REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE",
    "- MONITOR_CONTROL_DIRECT_AND_BLITZ_RISKY_FATIGUE_COST",
    "- REVIEW_CONTROL_BALANCED_BONUS_VISIBILITY",
    "- MONITOR_ROSTER_QUALITY_BONUS_CORRELATION",
    "- CONFIRM_FATIGUE_EFFECT_CALIBRATION",
    "- MONITOR_FATIGUE_OUTCOME_IMPACT",
    "- REVIEW_HIGH_LOAD_STYLE_COST",
    "- PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT",
    "- CONFIRM_ROSTER_STRESS_TESTS",
    "- CONFIRM_WEAK_BUILDS_FAIL_FOR_RIGHT_REASONS",
    "- MONITOR_BONUS_STYLE_FAIRNESS_WITH_STRESSED_ROSTERS",
    "- ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION",
    "",
    "## Guardrails",
    "- source reports consolidated for share: post-resolution-route-economy-monitoring.md and danger-phase-conversion-economy.md.",
    "- source reports remain in reports/ and are not deleted.",
    "- route point share is monitored, not forcibly equalized.",
    "- continuation payoff calibration creates future route quality, not immediate points.",
    "- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1; shot, try, drop, defensive recovery, goalkeeper, rebound, late-match, style, and bonus-fatigue audits are active without changing scoring values.",
    "",
  ].join("\n");
}
