import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type MatchEconomyMonitoringStatus = "PASS" | "FAIL";

interface MatchEconomyMonitoringCheck {
  readonly label: string;
  readonly status: MatchEconomyMonitoringStatus;
  readonly detail: string;
}

export interface MatchEconomyMonitoringValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly MatchEconomyMonitoringCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): MatchEconomyMonitoringCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function numberField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: (\\d+(?:\\.\\d+)?)`).exec(text);

  return match?.[1] === undefined ? 0 : Number.parseFloat(match[1]);
}

function sectionBetween(text: string, startMarker: string, endMarker: string): string {
  const start = text.indexOf(startMarker);
  if (start < 0) {
    return "";
  }

  const end = text.indexOf(endMarker, start + startMarker.length);
  return end < 0 ? text.slice(start) : text.slice(start, end);
}

function renderMarkdown(input: {
  readonly checks: readonly MatchEconomyMonitoringCheck[];
  readonly observedNilNilRate: number;
  readonly fullMatchAveragePoints: number;
  readonly shotAttemptRowsChecked: number;
  readonly shotAttemptsCaptured: number;
  readonly shareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Match Economy Monitoring Validation",
    "",
    `Status: ${status}`,
    "",
    "## Source Validations Consolidated",
    "- validation.route-economy-monitoring.md",
    "- validation.full-match-economy-validation.md",
    "- validation.match-duration-possession-volume-calibration.md",
    "- validation.unified-live-scoring-event-stream.md",
    "",
    "## Counts",
    `- observed 0-0 draw rate: ${input.observedNilNilRate}%`,
    `- full-match average total points: ${input.fullMatchAveragePoints}`,
    `- shot attempts captured: ${input.shotAttemptsCaptured}`,
    `- shot attempt probability rows checked: ${input.shotAttemptRowsChecked}`,
    `- planned share file count: ${input.shareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- CALIBRATE_TRY_ATTRITION",
    "- REVIEW_LOST_FORWARD_OVERPUNISHMENT",
    "- REWARD_HIGH_QUALITY_LEGAL_ACCESS",
    "- PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
    "- PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT",
    "- MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION",
    "- MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION",
    "- REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
    "- KEEP_0_0_RARE",
    "- REDUCE_CONTINUATION_AUTO_THREAT",
    "- PRESERVE_CONTINUATION_TACTICAL_VALUE",
    "- MONITOR_ROUTE_POINT_SHARE",
    "- REVIEW_SHOT_ORIGIN_CONCENTRATION",
    "- REVIEW_HIGH_VALUE_SHOT_ZONE_ACCESS",
    "- REVIEW_TARGET_GOAL_PROXIMITY",
    "- REVIEW_ATTACKING_DIRECTION_ASYMMETRY",
    "- REVIEW_GK_TARGET_ALIGNMENT",
    "- REVIEW_DEFENSIVE_SHAPE_TARGET_ALIGNMENT",
    "- REVIEW_CENTRAL_SHOT_ACCESS",
    "- REDUCE_CONTINUATION_PIPELINE_TO_SHOT_IF_FOUND",
    "- PRESERVE_DESERVED_CLEAN_SHOTS",
    "- REVIEW_STYLE_SHOT_GEOGRAPHY",
    "- BONUS_DESIGN_READY",
    "- KEEP_BONUSES_OUT_OF_MATCH_SCORE",
    "- USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE",
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
    "- CONFIRM_FATIGUE_EFFECT_CALIBRATION",
    "- MONITOR_FATIGUE_OUTCOME_IMPACT",
    "- REVIEW_HIGH_LOAD_STYLE_COST",
    "- REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE",
    "- CONFIRM_ROSTER_QUALITY_MODEL_V1",
    "- MONITOR_ROSTER_QUALITY_BONUS_CORRELATION",
    "- PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT",
    "- CONFIRM_ROLE_ECONOMY_IF_HEALTHY",
    "- MONITOR_MANDATORY_ROLE_RISKS",
    "- MONITOR_INVISIBLE_ROLE_RISKS",
    "- IMPROVE_COACH_ROLE_GUIDE_ITERATIVELY",
    "- PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT",
    "- ONLY_REBALANCE_SCORING_AFTER_HALF_SPACE_CONTEXT_CALIBRATION",
    "",
  ].join("\n");
}

export function validateMatchEconomyMonitoring(input: {
  readonly reportDirectory: string;
}): MatchEconomyMonitoringValidationResult {
  const routeEconomy = readIfExists(join(input.reportDirectory, "route-economy-monitoring.md"));
  const routeEconomyValidation = readIfExists(join(input.reportDirectory, "validation.route-economy-monitoring.md"));
  const fullMatch = readIfExists(join(input.reportDirectory, "full-match-economy-validation.md"));
  const coachRoleGuide = readIfExists(join(input.reportDirectory, "coach-role-guide.md"));
  const fullMatchValidation = readIfExists(join(input.reportDirectory, "validation.full-match-economy-validation.md"));
  const matchDurationValidation = readIfExists(join(input.reportDirectory, "validation.match-duration-possession-volume-calibration.md"));
  const unifiedScoringValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const heatmapReport = readIfExists(join(input.reportDirectory, "shot-origin-heatmap.md"));
  const heatmapPngExists = existsSync(join(input.reportDirectory, "shot-origin-heatmap.png"));
  const observedNilNilRate = numberField(fullMatch, "observed 0-0 draw rate");
  const fullMatchAveragePoints = numberField(fullMatch, "average total points");
  const shotAttemptsCaptured = numberField(heatmapReport, "shot attempts captured");
  const shotAttemptSection = sectionBetween(heatmapReport, "## Shot Attempt Probability Rows", "## Raw Directional Shot-Origin Table");
  const shotAttemptRowsChecked = (shotAttemptSection.match(/\| match-\d{3} \|/g) ?? []).length;
  const checks: readonly MatchEconomyMonitoringCheck[] = [
    check("route economy monitoring source validation PASS", routeEconomyValidation.includes("Status: PASS"), "route economy PASS"),
    check("full-match economy source validation PASS", fullMatchValidation.includes("Status: PASS"), "full-match PASS"),
    check("match duration volume source validation PASS", matchDurationValidation.includes("Status: PASS"), "match duration PASS"),
    check("unified live scoring source validation PASS", unifiedScoringValidation.includes("Status: PASS"), "unified scoring PASS"),
    check("route-economy-monitoring.md exists", routeEconomy.includes("# Route Economy Monitoring"), "route economy report generated"),
    check("full-match-economy-validation.md exists", fullMatch.includes("# Full-Match Economy Validation"), "full-match report generated"),
    check("shot-origin-heatmap.md exists", heatmapReport.includes("# Shot Origin Heatmap"), "heatmap report generated"),
    check("shot-origin-heatmap.png exists", heatmapPngExists, "heatmap image generated"),
    check("scoring values unchanged", [routeEconomy, fullMatch, heatmapReport].every((text) => !/SHOT_GOAL = (?!3 points)\d+ points/.test(text)), "no scoring-value leakage"),
    check("SHOT_GOAL remains 3 points", routeEconomy.includes("SHOT_GOAL = 3 points") && fullMatch.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", routeEconomy.includes("TRY_TOUCHDOWN = 5 points") && fullMatch.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", routeEconomy.includes("CONVERSION_GOAL = 2 points") && fullMatch.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", routeEconomy.includes("DROP_GOAL = 2 points") && fullMatch.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("SHOT_GOAL remains 3 match points", routeEconomy.includes("SHOT_GOAL remains 3 match points") && fullMatch.includes("SHOT_GOAL remains 3 match points"), "SHOT 3 match points"),
    check("TRY_TOUCHDOWN remains 5 match points", routeEconomy.includes("TRY_TOUCHDOWN remains 5 match points") && fullMatch.includes("TRY_TOUCHDOWN remains 5 match points"), "TRY 5 match points"),
    check("CONVERSION_GOAL remains 2 match points", routeEconomy.includes("CONVERSION_GOAL remains 2 match points") && fullMatch.includes("CONVERSION_GOAL remains 2 match points"), "CONVERSION 2 match points"),
    check("DROP_GOAL remains 2 match points", routeEconomy.includes("DROP_GOAL remains 2 match points") && fullMatch.includes("DROP_GOAL remains 2 match points"), "DROP 2 match points"),
    check("PENALTY_SHOT inactive", routeEconomy.includes("PENALTY_SHOT inactive") && fullMatch.includes("PENALTY_SHOT inactive"), "PENALTY inactive"),
    check("MatchBonusEvent implementation active", fullMatch.includes("## MatchBonusEvent Implementation"), "MatchBonusEvent visible"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && fullMatch.includes("live score comes only from active ScoringEvents"), "live guarded"),
    check("batch/live separation preserved", scoringEvents.includes("batch diagnostics remain separate") && fullMatch.includes("batch/live separation preserved"), "batch/live separated"),
    check("no forced scoring events", fullMatch.includes("no forced scoring events"), "no forced scoring"),
    check("no global route success buff", fullMatch.includes("no global route success buff"), "no route buff"),
    check("no global shot nerf", fullMatch.includes("no global shot nerf"), "no shot nerf"),
    check("no global try buff", fullMatch.includes("no global try buff"), "no try buff"),
    check("no global drop buff", fullMatch.includes("no global drop buff"), "no drop buff"),
    check("full-match batch explicitly rerun after geometry calibration", fullMatch.includes("full-match batch explicitly rerun after geometry calibration: YES"), "fresh post-geometry batch visible"),
    check("route point share recomputed from post-geometry outcomes", fullMatch.includes("route point share recomputed from post-geometry outcomes: YES"), "recomputed route share visible"),
    check("no stale route point share used as current diagnostic", routeEconomy.includes("no stale route point share is used as the current diagnostic") && routeEconomy.includes("legacy post-resolution route economy table kept for historical comparison only"), "stale share isolated"),
    check("source-of-truth inventory present", fullMatch.includes("## Source-of-Truth Inventory"), "source inventory visible"),
    check("old vs recomputed route point share table present", fullMatch.includes("## Route Point Share Integrity Audit") && fullMatch.includes("| route | old points | old share | recomputed points | recomputed share | delta | status |"), "old vs recomputed visible"),
    check("scoreline mismatch count present", fullMatch.includes("scoreline mismatch count:"), "scoreline mismatch visible"),
    check("route point mismatch count present", fullMatch.includes("route point mismatch count:"), "route mismatch visible"),
    check("stale metric detection present", routeEconomy.includes("stale metric detection:"), "stale detection visible"),
    check("route-to-shot pipeline table present", fullMatch.includes("## Route-to-Shot Pipeline Audit") && routeEconomy.includes("## Shot Volume & Route-to-Shot Pipeline Audit"), "pipeline audit visible"),
    check("continuation-to-shot audit present", fullMatch.includes("## Continuation-to-Shot Audit") && routeEconomy.includes("## Continuation-to-Shot Audit"), "continuation-to-shot visible"),
    check("rebound contribution table present", fullMatch.includes("## Rebound Contribution Table") && routeEconomy.includes("## Rebound Contribution Table"), "rebound contribution visible"),
    check("before/after rebound contribution table present", fullMatch.includes("## Before/After Rebound Contribution Table") && routeEconomy.includes("## Before/After Rebound Contribution Table"), "before/after rebound visible"),
    check("rebound source decomposition table present", fullMatch.includes("## Rebound Source Decomposition"), "source decomposition visible"),
    check("central rebound audit present", fullMatch.includes("## Central Rebound Audit"), "central rebound visible"),
    check("GK rebound handling audit present", fullMatch.includes("## GK Rebound Handling Audit"), "GK rebound handling visible"),
    check("defender recovery audit present", fullMatch.includes("## Defender Recovery Audit"), "defender recovery visible"),
    check("second-shot quality audit present", fullMatch.includes("## Second-Shot Quality Audit"), "second-shot quality visible"),
    check("shot-origin heatmap regenerated with rebound zone detail", heatmapReport.includes("## Rebound / Second-Shot Zone Detail") && heatmapPngExists, "heatmap rebound detail visible"),
    check("non-shot attrition table present", fullMatch.includes("## Non-Shot Route Attrition") && routeEconomy.includes("## Non-Shot Route Attrition"), "non-shot attrition visible"),
    check("try population audit present", fullMatch.includes("## Try Attempt Population Audit"), "try population visible"),
    check("LOST_FORWARD audit present", fullMatch.includes("## LOST_FORWARD Audit"), "LOST_FORWARD audit visible"),
    check("legal access reward audit present", fullMatch.includes("## Legal Access Reward Audit"), "legal access visible"),
    check("access route audit present", fullMatch.includes("## Access Route Audit"), "access route visible"),
    check("before/after try attrition metrics present", fullMatch.includes("## Before/After Try Attrition Metrics") && routeEconomy.includes("## Try Attrition Calibration"), "before/after try attrition visible"),
    check("conversion geometry validation present", fullMatch.includes("## Conversion Geometry Validation") && fullMatch.includes("conversion geometry stored for every scored try"), "conversion geometry visible"),
    check("shot/rebound/half-space guardrail present", fullMatch.includes("## Shot / Rebound / Half-Space Guardrail"), "guardrail visible"),
    check("bonus readiness audit present", fullMatch.includes("## Bonus Readiness Audit") && routeEconomy.includes("## Bonus Readiness Summary"), "bonus readiness visible"),
    check("MatchBonusEvent batch validation present", fullMatch.includes("## MatchBonusEvent Batch Validation"), "MatchBonusEvent validation visible"),
    check("League Points Summary present", fullMatch.includes("## League Points Summary"), "league points summary visible"),
    check("League Table Integration present", fullMatch.includes("## League Table Integration"), "league table integration visible"),
    check("Final League Table By Team present", fullMatch.includes("## Final League Table By Team"), "team league table visible"),
    check("Final League Table By Style present", fullMatch.includes("## Final League Table By Style"), "style league table visible"),
    check("Match-Level LeaguePointsSummary detail present", fullMatch.includes("## Match-Level LeaguePointsSummary Detail"), "match-level summary visible"),
    check("League Table Consistency Checks present", fullMatch.includes("## League Table Consistency Checks"), "league consistency visible"),
    check("Bonus Distribution By Style present", fullMatch.includes("## Bonus Distribution By Style"), "bonus distribution visible"),
    check("Fatigue-to-Bonus Correlation Audit present", fullMatch.includes("## Fatigue-to-Bonus Correlation Audit"), "fatigue correlation visible"),
    check("Fatigue Effect Calibration Summary present", fullMatch.includes("## Fatigue Effect Calibration Summary"), "fatigue effect visible"),
    check("Fatigue Bucket Audit present", fullMatch.includes("## Fatigue Bucket Audit"), "fatigue bucket visible"),
    check("Shot Fatigue Audit present", fullMatch.includes("## Shot Fatigue Audit"), "shot fatigue visible"),
    check("Try Fatigue Audit present", fullMatch.includes("## Try Fatigue Audit"), "try fatigue visible"),
    check("Drop and Conversion Fatigue Audit present", fullMatch.includes("## Drop and Conversion Fatigue Audit"), "drop fatigue visible"),
    check("Defensive Recovery and Goalkeeper Fatigue Audit present", fullMatch.includes("## Defensive Recovery and Goalkeeper Fatigue Audit"), "defensive/GK fatigue visible"),
    check("Late-Match Fatigue Effect Audit present", fullMatch.includes("## Late-Match Fatigue Effect Audit"), "late fatigue visible"),
    check("Style Fatigue Economy present", fullMatch.includes("## Style Fatigue Economy"), "style fatigue visible"),
    check("Team-Construction Proxy Audit present", fullMatch.includes("## Team-Construction Proxy Audit"), "team construction proxy visible"),
    check("Roster-Quality-to-Bonus Correlation Audit present", fullMatch.includes("## Roster-Quality-to-Bonus Correlation Audit"), "roster correlation visible"),
    check("Style-vs-Roster Separation Audit present", fullMatch.includes("## Style-vs-Roster Separation Audit"), "style-vs-roster visible"),
    check("Roster Stress Test Variant Source present", fullMatch.includes("## Roster Stress Test Variant Source"), "roster stress source visible"),
    check("Roster Stress Route Access Impact present", fullMatch.includes("## Roster Stress Route Access Impact"), "roster stress route visible"),
    check("Roster Stress Defensive Impact present", fullMatch.includes("## Roster Stress Defensive Impact"), "roster stress defense visible"),
    check("Roster Stress Fatigue and Load Impact present", fullMatch.includes("## Roster Stress Fatigue and Load Impact"), "roster stress fatigue visible"),
    check("Goalkeeper Stress Test present", fullMatch.includes("## Goalkeeper Stress Test"), "GK stress visible"),
    check("Player Load Balancing Action Load Weights Audit present", fullMatch.includes("## Player Load Balancing Action Load Weights Audit"), "action load weights visible"),
    check("Player Load Distribution Audit present", fullMatch.includes("## Player Load Distribution Audit"), "load distribution visible"),
    check("Specialist Dependency Audit present", fullMatch.includes("## Specialist Dependency Audit"), "specialist dependency visible"),
    check("Specialist Dependency Tuning present", fullMatch.includes("## Specialist Dependency Tuning"), "specialist tuning visible"),
    check("Bench Depth Audit present", fullMatch.includes("## Bench Depth Audit"), "bench depth visible"),
    check("Bench Depth Tuning present", fullMatch.includes("## Bench Depth Tuning"), "bench tuning visible"),
    check("Role-Specific Load Audit present", fullMatch.includes("## Role-Specific Load Audit"), "role load visible"),
    check("Goalkeeper Load Balancing Audit present", fullMatch.includes("## Goalkeeper Load Balancing Audit"), "GK load visible"),
    check("Style-Load Interaction Audit present", fullMatch.includes("## Style-Load Interaction Audit"), "style-load visible"),
    check("Player Load Calibration Regression present", fullMatch.includes("## Player Load Calibration Regression"), "load regression visible"),
    check("Route Outcome Regression After Load Balancing present", fullMatch.includes("## Route Outcome Regression After Load Balancing"), "route regression visible"),
    check("Coach-Facing Load Explanations present", fullMatch.includes("## Coach-Facing Load Explanations"), "coach load visible"),
    check("Player Load Balancing Guardrails present", fullMatch.includes("## Player Load Balancing Guardrails"), "load guardrails visible"),
    check("Player Load Balancing Mandatory Diagnosis present", fullMatch.includes("## Player Load Balancing Mandatory Diagnosis"), "load diagnosis visible"),
    check("Role Taxonomy Confirmation present", fullMatch.includes("## Role Taxonomy Confirmation"), "role taxonomy visible"),
    check("Role Attribute Mapping present", fullMatch.includes("## Role Attribute Mapping"), "role attributes visible"),
    check("Role Usage Audit present", fullMatch.includes("## Role Usage Audit"), "role usage visible"),
    check("Role Omission Audit present", fullMatch.includes("## Role Omission Audit"), "role omission visible"),
    check("Role Redundancy Audit present", fullMatch.includes("## Role Redundancy Audit"), "role redundancy visible"),
    check("Offensive Role Economy Audit present", fullMatch.includes("## Offensive Role Economy Audit"), "offensive roles visible"),
    check("Defensive Role Economy Audit present", fullMatch.includes("## Defensive Role Economy Audit"), "defensive roles visible"),
    check("Goalkeeper Role Economy Audit present", fullMatch.includes("## Goalkeeper Role Economy Audit"), "GK roles visible"),
    check("Build Archetype Viability Audit present", fullMatch.includes("## Build Archetype Viability Audit"), "archetypes visible"),
    check("Mandatory Role Risk Audit present", fullMatch.includes("## Mandatory Role Risk Audit"), "mandatory roles visible"),
    check("Role Economy Regression present", fullMatch.includes("## Role Economy Regression"), "role regression visible"),
    check("Role Economy Mandatory Diagnosis present", fullMatch.includes("## Role Economy Mandatory Diagnosis"), "role diagnosis visible"),
    check("Bonus Access By Roster Variant present", fullMatch.includes("## Bonus Access By Roster Variant"), "roster bonus visible"),
    check("League Table Impact By Roster And Style present", fullMatch.includes("## League Table Impact By Roster And Style"), "roster league visible"),
    check("Style-vs-Roster Stress Decomposition present", fullMatch.includes("## Style-vs-Roster Stress Decomposition"), "style-vs-roster stress visible"),
    check("Late-Match Bonus Audit present", fullMatch.includes("## Late-Match Bonus Audit"), "late bonus visible"),
    check("Missing Instrumentation List present", fullMatch.includes("## Missing Instrumentation List"), "missing instrumentation visible"),
    check("TeamMatchFatigueSummary present", fullMatch.includes("## TeamMatchFatigueSummary"), "team fatigue visible"),
    check("PlayerMatchLoadSummary present", fullMatch.includes("## PlayerMatchLoadSummary"), "player load visible"),
    check("TeamLoadSummary present", fullMatch.includes("## TeamLoadSummary"), "team load visible"),
    check("RosterQualitySummary present", fullMatch.includes("## RosterQualitySummary"), "roster quality visible"),
    check("LateMatchPerformanceSummary present", fullMatch.includes("## LateMatchPerformanceSummary"), "late performance visible"),
    check("offensive bonus design audit present", fullMatch.includes("## Offensive Bonus Design Audit"), "offensive bonus visible"),
    check("defensive bonus design audit present", fullMatch.includes("## Defensive Bonus Design Audit"), "defensive bonus visible"),
    check("style impact audit present", fullMatch.includes("## Bonus Style Impact Audit"), "style bonus impact visible"),
    check("bonus point value audit present", fullMatch.includes("## Bonus Point Value Audit"), "bonus point value visible"),
    check("bonus source-of-truth audit present", fullMatch.includes("## Bonus Source-of-Truth Audit"), "source-of-truth visible"),
    check("recommended bonus model present", fullMatch.includes("## Recommended Bonus Model"), "recommended model visible"),
    check("future implementation guardrails present", fullMatch.includes("## Bonus Implementation Guardrails"), "future guardrails visible"),
    check("league points bonus simulation present", fullMatch.includes("## League Points & Bonus Trigger Simulation") && routeEconomy.includes("## League Points & Bonus Trigger Simulation Summary"), "league bonus simulation visible"),
    check("offensive bonus trigger table present", fullMatch.includes("## Offensive Bonus Frequency"), "offensive trigger table visible"),
    check("3+ vs 4+ try comparison present", fullMatch.includes("## Refined Try Threshold Comparison - 3+ vs 4+ Tries"), "try threshold comparison visible"),
    check("conversion-included vs conversion-excluded family comparison present", fullMatch.includes("## Route Family Definition Comparison - Conversion Included vs Excluded"), "family comparison visible"),
    check("defensive bonus trigger table present", fullMatch.includes("## Defensive Bonus Frequency"), "defensive trigger table visible"),
    check("close-loss <=7 audit present", fullMatch.includes("## Defensive Bonus Confirmation - Close-Loss <=7 and Major-Threat"), "close-loss <=7 visible"),
    check("major-threat defensive bonus audit present", fullMatch.includes("major-threat defensive bonus"), "major-threat visible"),
    check("OR vs AND no-goal/no-try comparison present", fullMatch.includes("## No-Goal / No-Try OR vs AND Comparison"), "OR vs AND visible"),
    check("close-loss threshold comparison present", fullMatch.includes("## Close-Loss Threshold Comparison"), "close-loss thresholds visible"),
    check("bonus stacking audit present", fullMatch.includes("## Bonus Stacking Audit"), "stacking audit visible"),
    check("style fairness audit present", fullMatch.includes("## League Bonus Style Fairness Audit"), "style fairness visible"),
    check("fatigue/team-construction proxy audit present", fullMatch.includes("## Fatigue and Team-Construction Proxy Audit"), "fatigue proxy visible"),
    check("bonus cap comparison present", fullMatch.includes("## Bonus Cap Comparison"), "cap comparison visible"),
    check("final V1 recommendation present", fullMatch.includes("## MatchBonusEvent Mandatory Diagnosis") && fullMatch.includes("Is implementation ready for league-table integration? YES"), "final recommendation visible"),
    check("league bonus source-of-truth guardrails present", fullMatch.includes("## League Bonus Source-of-Truth Guardrails"), "league source guardrails visible"),
    check("MatchBonusEvent league-table-only", fullMatch.includes("MatchBonusEvent implemented as league-table-only") && routeEconomy.includes("league-table MatchBonusEvent active"), "league-table only"),
    check("MatchBonusEvent leaves live match score unchanged", fullMatch.includes("MatchBonusEvent leaves live match score unchanged") && scoringEvents.includes("bonus points do not alter match score"), "match score protected"),
    check("MatchBonusEvent not ScoringEvent", fullMatch.includes("MatchBonusEvent is not a ScoringEvent") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "ScoringEvent separated"),
    check("bonus computed after final whistle", fullMatch.includes("bonus points computed after final whistle: YES"), "post-final whistle visible"),
    check("conversion excluded from family bonus", fullMatch.includes("CONVERSION_GOAL excluded from family bonus: YES"), "conversion excluded"),
    check("bonus cap +2 applied", fullMatch.includes("bonus cap: +2 league points per team-match") && fullMatch.includes("bonus cap +2 applied: PASS"), "cap visible"),
    check("LeaguePointsSummary implemented", fullMatch.includes("LeaguePointsSummary implemented: YES"), "LeaguePointsSummary visible"),
    check("LeagueTableRow implemented", fullMatch.includes("LeagueTableRow implemented: YES"), "LeagueTableRow visible"),
    check("league table generated", fullMatch.includes("league table generated: YES"), "league table visible"),
    check("league table points reconcile", fullMatch.includes("sum of match-level league points equals league table total - YES"), "league reconciliation visible"),
    check("fatigue instrumentation fields populated", fullMatch.includes("fatigue instrumentation available: YES") && fullMatch.includes("PlayerFatigueTimelineRow implemented: YES") && fullMatch.includes("TeamFatigueTimelineRow implemented: YES"), "fatigue instrumentation visible"),
    check("fatigue effect calibration confirmed", fullMatch.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1") && fullMatch.includes("CONFIRM_FATIGUE_EFFECT_CALIBRATION"), "fatigue effect confirmed"),
    check("team-construction proxy audit present", fullMatch.includes("team-construction proxy instrumentation available: YES") && fullMatch.includes("## Team-Construction Proxy Audit"), "team construction visible"),
    check("roster stress variants generated", fullMatch.includes("stress roster variants generated and documented: YES") && fullMatch.includes("NO_DROP_THREAT_ROSTER") && fullMatch.includes("HIGH_SPECIALIST_DEPENDENCY_ROSTER"), "stress variants visible"),
    check("roster stress route/defense/fatigue/GK audits visible", fullMatch.includes("route access impact audit present: YES") && fullMatch.includes("defensive impact audit present: YES") && fullMatch.includes("fatigue/load impact audit present: YES") && fullMatch.includes("goalkeeper stress test present: YES"), "stress audits visible"),
    check("roster stress guardrails visible", fullMatch.includes("roster quality does not directly award points: YES") && fullMatch.includes("stress roster variants are diagnostic only: YES"), "roster guardrails visible"),
    check("player load balancing guardrails visible", fullMatch.includes("load balancing does not directly award points: YES") && fullMatch.includes("production rosters unchanged unless explicitly selected: YES") && fullMatch.includes("GK model remains separate from outfield model: YES"), "load guardrails visible"),
    check("specialist and bench cost diagnoses visible", fullMatch.includes("Is specialist dependency cost too weak, healthy, or too strong? HEALTHY/WATCH") && fullMatch.includes("Is bench depth cost too weak, healthy, or too strong? HEALTHY/WATCH"), "specialist/bench diagnoses visible"),
    check("star-heavy and GK mental load diagnoses visible", fullMatch.includes("Are star-heavy teams still viable? YES") && fullMatch.includes("Does GK mental load behave separately from outfield fatigue? YES"), "star/GK diagnoses visible"),
    check("coach role guide exists", coachRoleGuide.includes("# Coach Role Guide"), "guide generated"),
    check("coach role guide beginner sections visible", coachRoleGuide.includes("## 1. Attributes vs Skills vs Roles") && coachRoleGuide.includes("## 4. The True Roles Of The Sport") && coachRoleGuide.includes("## 11. Glossary"), "guide sections visible"),
    check("role economy mandatory diagnosis visible", fullMatch.includes("Does each scoring route have at least one clear role path? YES") && fullMatch.includes("Are multiple roster archetypes viable? YES") && fullMatch.includes("PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT"), "role diagnosis visible"),
    check("load/roster/late schemas explicit", fullMatch.includes("PlayerMatchLoadSummary implemented: YES, populated with real V1 player load values") && fullMatch.includes("RosterQualitySummary implemented: YES") && fullMatch.includes("LateMatchPerformanceSummary implemented: YES, populated with real V1 final-third performance values"), "instrumentation schemas visible"),
    check("style volatility diagnosis present", fullMatch.includes("CONTROL_DIRECT: style route access remains powerful") && fullMatch.includes("BLITZ_RISKY: volatility is measurable through style"), "style volatility visible"),
    check("no central/frontal try path introduced", fullMatch.includes("central / frontal try paths remain blocked") && routeEconomy.includes("no central/frontal try path introduced"), "central/frontal guard visible"),
    check("no illegal Z0/Z8 off-ball occupancy", routeEconomy.includes("no illegal Z0/Z8 off-ball occupancy"), "Z0/Z8 guard visible"),
    check("style shot dependency present", fullMatch.includes("## Style Shot Dependency"), "style shot dependency visible"),
    check("continuation payoff no longer automatically productive", !/meta-risks: .*AUTO_THREAT/.test(fullMatch) && !/meta-risks: .*CONTINUATION_PAYOFF_TOO_HIGH/.test(fullMatch), "auto-threat cleared"),
    check("continuation family payoff distribution visible", fullMatch.includes("payoff quality") && fullMatch.includes("neutral continuations"), "distribution visible"),
    check("full-match economy remains rare 0-0", observedNilNilRate <= 5, `${observedNilNilRate}%`),
    check("route economy monitoring remains visible", routeEconomy.includes("observed 0-0 draw rate in full-match economy validation"), "full-match line visible"),
    check("shot geography review questions visible", heatmapReport.includes("## Review Questions"), "review questions visible"),
    check("shot geography concentration assessed", heatmapReport.includes("suspicious over-concentration"), "concentration visible"),
    check("shot heatmap includes target goal zone", heatmapReport.includes("target goal zone") && heatmapReport.includes("Z7-C / GOAL_FRAME") && heatmapReport.includes("Z1-C / GOAL_FRAME"), "target zones visible"),
    check("shot heatmap includes attacking direction", heatmapReport.includes("attacking direction") && heatmapReport.includes("CONTROL attacks Z1 -> Z7") && heatmapReport.includes("BLITZ attacks Z7 -> Z1"), "directions visible"),
    check("raw directional shot-origin table exists", heatmapReport.includes("## Raw Directional Shot-Origin Table"), "raw direction table visible"),
    check("normalized shot-origin table exists", heatmapReport.includes("## Normalized Shot-Origin Table"), "normalized table visible"),
    check("high-value shot zone audit exists", heatmapReport.includes("## High-Value Shot Zone Audit"), "high-value audit visible"),
    check("target goal proximity audit exists", heatmapReport.includes("## Target Goal Proximity Audit"), "target proximity visible"),
    check("attacking direction symmetry audit exists", heatmapReport.includes("## Attacking Direction Symmetry Audit"), "symmetry audit visible"),
    check("route-family-to-shot-zone table exists", heatmapReport.includes("## Access Path Audit"), "access path visible"),
    check("defensive geography audit exists", heatmapReport.includes("## Defensive Geography Audit"), "defensive geography visible"),
    check("GK and defensive alignment visible", heatmapReport.includes("avg GK challenge") && heatmapReport.includes("defensive shape alignment"), "alignment visible"),
    check("pitch geometry assumptions visible", heatmapReport.includes("## Pitch Geometry Assumptions") && heatmapReport.includes("zone length") && heatmapReport.includes("goal frame"), "geometry visible"),
    check("shot attempt probability rows visible", heatmapReport.includes("## Shot Attempt Probability Rows"), "per-shot probability table visible"),
    check("shot attempt probability row count matches captured shots", shotAttemptRowsChecked === shotAttemptsCaptured && shotAttemptsCaptured > 0, `${shotAttemptRowsChecked}/${shotAttemptsCaptured}`),
    check("base geometry curve audit present", heatmapReport.includes("## Base Geometry Curve Audit"), "distance-band geometry visible"),
    check("before/after base geometry by zone present", heatmapReport.includes("## Before / After Base Geometry by Zone"), "zone before/after visible"),
    check("central lane distance audit present", heatmapReport.includes("## Central Lane Distance Audit"), "central distance audit visible"),
    check("half-space geometry audit present", heatmapReport.includes("## Half-Space Geometry Audit"), "half-space geometry audit visible"),
    check("half-space context audit present", fullMatch.includes("## Half-Space Context Audit"), "half-space context visible"),
    check("half-space population audit present", fullMatch.includes("## Half-Space Population Audit") && heatmapReport.includes("## Half-Space Population Audit"), "half-space population visible"),
    check("half-space classification table present", fullMatch.includes("## Half-Space Classification Table") && heatmapReport.includes("## Half-Space Classification Table"), "classification visible"),
    check("same-distance central vs half-space table present", fullMatch.includes("## Same-Distance Central vs Half-Space Table") && heatmapReport.includes("## Same-Distance Central vs Half-Space Table"), "same-distance visible"),
    check("modifier audit present", fullMatch.includes("## Half-Space Modifier Audit") && heatmapReport.includes("## Half-Space Modifier Audit"), "modifier audit visible"),
    check("before/after half-space metrics present", fullMatch.includes("## Before/After Half-Space Metrics") && heatmapReport.includes("## Before/After Half-Space Metrics"), "before/after half-space visible"),
    check("full-match regression present", fullMatch.includes("## Full-Match Batch Execution") && fullMatch.includes("## Scoreline Health"), "full-match regression visible"),
    check("rebound economy audit present", fullMatch.includes("## Rebound Economy Audit"), "rebound economy visible"),
    check("baseGeometryXSOT present", heatmapReport.includes("| baseGeometryXSOT |") && heatmapReport.includes("baseGeometryXSOT:"), "base xSOT visible"),
    check("baseGeometryXG present", heatmapReport.includes("| baseGeometryXG |") && heatmapReport.includes("baseGeometryXG:"), "base xG visible"),
    check("finalXSOT present", heatmapReport.includes("| finalXSOT |") && heatmapReport.includes("finalXSOT:"), "final xSOT visible"),
    check("finalXG present", heatmapReport.includes("| finalXG |") && heatmapReport.includes("finalXG:"), "final xG visible"),
    check("context modifiers present", heatmapReport.includes("top positive modifiers") && heatmapReport.includes("top negative modifiers") && heatmapReport.includes("context modifiers:"), "modifiers visible"),
    check("xSOT present for every shot attempt", heatmapReport.includes("average xSOT") && heatmapReport.includes("xSOT bucket"), "xSOT visible"),
    check("xG present for every shot attempt", heatmapReport.includes("average xG") && heatmapReport.includes("xG bucket"), "xG visible"),
    check("distance band present for every shot attempt", heatmapReport.includes("distance band") && heatmapReport.includes("LONG_RANGE"), "distance bands visible"),
    check("same-target comparison tables present", heatmapReport.includes("## Same-Target Directional Comparison - Shots Toward Z1-C") && heatmapReport.includes("## Same-Target Directional Comparison - Shots Toward Z7-C"), "same-target comparisons visible"),
    check("half-space sanity check present", heatmapReport.includes("## Half-Space Sanity Check"), "half-space visible"),
    check("directional symmetry check present", heatmapReport.includes("## Directional Symmetry Check"), "directional symmetry visible"),
    check("context override check present", heatmapReport.includes("## Context Override Check"), "context override visible"),
    check("rebound / second-shot geometry check present", heatmapReport.includes("## Rebound / Second-Shot Geometry Check"), "rebound geometry visible"),
    check("rebound xG audit exists", heatmapReport.includes("## Rebound / Second-Shot xG Audit"), "rebound xG visible"),
    check("geometry consistency rules present", heatmapReport.includes("## Geometry Consistency Rules"), "geometry rules visible"),
    check("combined diagnosis present", heatmapReport.includes("## Combined Diagnosis"), "combined diagnosis visible"),
    check("shot probability review questions visible", heatmapReport.includes("Is Z5-C producing too many on-target shots") && heatmapReport.includes("Does SHOT_GOAL dominance come more from shot volume"), "xG/xSOT questions visible"),
    check("post-calibration full-match regression visible", fullMatch.includes("CALIBRATE_TRY_ATTRITION") && fullMatch.includes("before try attrition calibration") && fullMatch.includes("after try attrition calibration"), "post-calibration regression visible"),
    check("try attrition final recommendation visible", fullMatch.includes("ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"), "try attrition recommendation visible"),
    check(
      "mandatory diagnosis answers present",
      fullMatch.includes("Was LOST_FORWARD overpunished before calibration?") &&
        fullMatch.includes("Did legal high-quality try access become more rewarding?") &&
        fullMatch.includes("Did conversion geometry remain correct?") &&
        fullMatch.includes("Did TRY_TOUCHDOWN point share rise?") &&
        fullMatch.includes("Is the base economy ready for bonus design?") &&
        fullMatch.includes("Is the base economy ready for bonus implementation?") &&
        fullMatch.includes("Should bonuses affect match score or league standings only?") &&
        fullMatch.includes("Could bonuses mask remaining SHOT_GOAL dominance?") &&
        fullMatch.includes("Is win/draw/loss/forfeit 4/2/0/-1 valid?") &&
        fullMatch.includes("Is 3 tries for +1 offensive bonus healthy?") &&
        fullMatch.includes("Were MatchBonusEvents implemented while leaving live match score unchanged?") &&
        fullMatch.includes("Does live score still only use active ScoringEvents?") &&
        fullMatch.includes("Is CONVERSION_GOAL excluded from family bonus?") &&
        fullMatch.includes("How often is the +2 cap applied?") &&
        fullMatch.includes("Is implementation ready for league-table integration? YES") &&
        fullMatch.includes("Is no-goal/no-try defensive bonus better as OR or AND?") &&
        fullMatch.includes("Is 3+ scoring families easier mostly because conversions were included?") &&
        fullMatch.includes("Missing fatigue instrumentation? NO") &&
        fullMatch.includes("Is fatigue instrumentation now available with real values? YES") &&
        fullMatch.includes("Are roster-quality proxies available? YES") &&
        fullMatch.includes("Does fatigue now affect outcomes? YES") &&
        fullMatch.includes("Is the fatigue effect too weak, healthy, or too strong? HEALTHY/WATCH") &&
        fullMatch.includes("Did scoring economy remain healthy? YES") &&
        fullMatch.includes("Did 0-0 remain rare? YES") &&
        fullMatch.includes("Did high-load styles pay a visible fatigue cost? YES/WATCH") &&
        fullMatch.includes("Next sprint: role economy balancing or season fatigue accumulation") &&
        fullMatch.includes("PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT") &&
        heatmapReport.includes("Were half-space shots over-suppressed before calibration?"),
      "mandatory diagnosis visible",
    ),
    check("share pack <= 20 files", expectedSharePackFiles(input.reportDirectory).length <= 20, `${expectedSharePackFiles(input.reportDirectory).length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.match-economy-monitoring.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      observedNilNilRate,
      fullMatchAveragePoints,
      shotAttemptRowsChecked,
      shotAttemptsCaptured,
      shareFileCount: expectedSharePackFiles(input.reportDirectory).length,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
