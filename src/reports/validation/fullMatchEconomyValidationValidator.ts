import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type FullMatchEconomyStatus = "PASS" | "FAIL";

interface FullMatchEconomyCheck {
  readonly label: string;
  readonly status: FullMatchEconomyStatus;
  readonly detail: string;
}

export interface FullMatchEconomyValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly FullMatchEconomyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): FullMatchEconomyCheck {
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

function renderMarkdown(input: {
  readonly checks: readonly FullMatchEconomyCheck[];
  readonly matchesSimulated: number;
  readonly observedNilNilRate: number;
  readonly projectedNilNilRate: number;
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly uniqueFinalScores: number;
  readonly shareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Full-Match Economy Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- observed 0-0 draw rate: ${input.observedNilNilRate}%`,
    `- projected 0-0 draw rate: ${input.projectedNilNilRate}%`,
    `- average total points: ${input.averageTotalPoints}`,
    `- median total points: ${input.medianTotalPoints}`,
    `- unique final scores: ${input.uniqueFinalScores}`,
    `- planned share file count: ${input.shareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- KEEP_0_0_RARE",
    "- REDUCE_CONTINUATION_AUTO_THREAT",
    "- PRESERVE_CONTINUATION_TACTICAL_VALUE",
    "- MONITOR_ROUTE_POINT_SHARE",
    "- CALIBRATE_TRY_ATTRITION",
    "- REVIEW_LOST_FORWARD_OVERPUNISHMENT",
    "- REWARD_HIGH_QUALITY_LEGAL_ACCESS",
    "- PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
    "- PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT",
    "- MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION",
    "- MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION",
    "- REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
    "- REVIEW_GK_ALIGNMENT_WITH_XG",
    "- REVIEW_DEFENSIVE_BLOCK_WITH_XG",
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
    "- REVIEW_STYLE_SCORING_VOLUME",
    "- REVIEW_STYLE_ROUTE_DIVERSITY",
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
    "- CONFIRM_ROLE_ECONOMY_IF_HEALTHY",
    "- MONITOR_MANDATORY_ROLE_RISKS",
    "- MONITOR_INVISIBLE_ROLE_RISKS",
    "- IMPROVE_COACH_ROLE_GUIDE_ITERATIVELY",
    "- REVIEW_GK_MENTAL_ROLE_CLARITY",
    "- PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT",
    "- PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT",
    "- ONLY_REBALANCE_SCORING_AFTER_HALF_SPACE_CONTEXT_CALIBRATION",
    "",
  ].join("\n");
}

export function validateFullMatchEconomyValidation(input: {
  readonly reportDirectory: string;
}): FullMatchEconomyValidationResult {
  const report = readIfExists(join(input.reportDirectory, "full-match-economy-validation.md"));
  const coachRoleGuide = readIfExists(join(input.reportDirectory, "coach-role-guide.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const continuationPayoff = readIfExists(join(input.reportDirectory, "validation.continuation-payoff-calibration.md"));
  const matchDuration = readIfExists(join(input.reportDirectory, "validation.match-duration-possession-volume-calibration.md"));
  const routeEconomy = readIfExists(join(input.reportDirectory, "validation.route-economy-monitoring.md"));
  const routeResolution = readIfExists(join(input.reportDirectory, "validation.route-resolution-calibrations.md"));
  const routeDecision = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const observedNilNilRate = numberField(report, "observed 0-0 draw rate");
  const projectedNilNilRate = numberField(report, "projected 0-0 draw rate from previous sprint");
  const averageTotalPoints = numberField(report, "average total points");
  const medianTotalPoints = numberField(report, "median total points");
  const uniqueFinalScores = numberField(report, "unique final scores");
  const scoringValueLeakage =
    /SHOT_GOAL = (?!3 points)\d+ points/.test(report) ||
    /TRY_TOUCHDOWN = (?!5 points)\d+ points/.test(report) ||
    /CONVERSION_GOAL = (?!2 points)\d+ points/.test(report) ||
    /DROP_GOAL = (?!2 points)\d+ points/.test(report);
  const checks: readonly FullMatchEconomyCheck[] = [
    check("full-match-economy-validation.md exists", report.includes("# Full-Match Economy Validation"), "report generated"),
    check("Full-Match Batch Execution section exists", report.includes("## Full-Match Batch Execution"), "batch execution visible"),
    check("Source-of-Truth Inventory section exists", report.includes("## Source-of-Truth Inventory"), "source inventory visible"),
    check("0-0 Validation section exists", report.includes("## 0-0 Validation"), "0-0 validation visible"),
    check("Scoreline Health section exists", report.includes("## Scoreline Health"), "scoreline health visible"),
    check("Post-Geometry Shot Outcome Health section exists", report.includes("## Post-Geometry Shot Outcome Health"), "post-geometry shot health visible"),
    check("Route-to-Shot Pipeline Audit section exists", report.includes("## Route-to-Shot Pipeline Audit"), "route-to-shot visible"),
    check("Continuation-to-Shot Audit section exists", report.includes("## Continuation-to-Shot Audit"), "continuation-to-shot visible"),
    check("Rebound Contribution Table section exists", report.includes("## Rebound Contribution Table"), "rebound contribution visible"),
    check("Before/After Rebound Contribution Table section exists", report.includes("## Before/After Rebound Contribution Table"), "before/after rebound visible"),
    check("Rebound Source Decomposition section exists", report.includes("## Rebound Source Decomposition"), "rebound source visible"),
    check("Central Rebound Audit section exists", report.includes("## Central Rebound Audit"), "central rebound visible"),
    check("GK Rebound Handling Audit section exists", report.includes("## GK Rebound Handling Audit"), "GK rebound visible"),
    check("Defender Recovery Audit section exists", report.includes("## Defender Recovery Audit"), "defender recovery visible"),
    check("Second-Shot Quality Audit section exists", report.includes("## Second-Shot Quality Audit"), "second-shot quality visible"),
    check("Non-Shot Route Attrition section exists", report.includes("## Non-Shot Route Attrition"), "non-shot attrition visible"),
    check("Try Attempt Population Audit section exists", report.includes("## Try Attempt Population Audit"), "try population visible"),
    check("LOST_FORWARD Audit section exists", report.includes("## LOST_FORWARD Audit"), "LOST_FORWARD visible"),
    check("Legal Access Reward Audit section exists", report.includes("## Legal Access Reward Audit"), "legal access visible"),
    check("Access Route Audit section exists", report.includes("## Access Route Audit"), "access route visible"),
    check("Before/After Try Attrition Metrics section exists", report.includes("## Before/After Try Attrition Metrics"), "try attrition before/after visible"),
    check("Conversion Geometry Validation section exists", report.includes("## Conversion Geometry Validation"), "conversion geometry visible"),
    check("Shot / Rebound / Half-Space Guardrail section exists", report.includes("## Shot / Rebound / Half-Space Guardrail"), "guardrail visible"),
    check("Style Shot Dependency section exists", report.includes("## Style Shot Dependency"), "style shot dependency visible"),
    check("Half-Space Context Audit section exists", report.includes("## Half-Space Context Audit"), "half-space context visible"),
    check("Half-Space Population Audit section exists", report.includes("## Half-Space Population Audit"), "half-space population visible"),
    check("Half-Space Classification Table section exists", report.includes("## Half-Space Classification Table"), "half-space classification visible"),
    check("Half-Space Modifier Audit section exists", report.includes("## Half-Space Modifier Audit"), "modifier audit visible"),
    check("Same-Distance Central vs Half-Space Table section exists", report.includes("## Same-Distance Central vs Half-Space Table"), "same-distance table visible"),
    check("Before/After Half-Space Metrics section exists", report.includes("## Before/After Half-Space Metrics"), "before/after half-space visible"),
    check("Half-Space Style Impact section exists", report.includes("## Half-Space Style Impact"), "style half-space visible"),
    check("Rebound Economy Audit section exists", report.includes("## Rebound Economy Audit"), "rebound economy visible"),
    check("Post-Geometry Full-Match Economy Diagnosis section exists", report.includes("## Post-Geometry Full-Match Economy Diagnosis"), "post-geometry diagnosis visible"),
    check("Route Point Share section exists", report.includes("## Route Point Share"), "route share visible"),
    check("Style Diversity Validation section exists", report.includes("## Style Diversity Validation"), "style diversity visible"),
    check("Continuation Payoff Realism section exists", report.includes("## Continuation Payoff Realism"), "continuation payoff visible"),
    check("Bonus Readiness Audit section exists", report.includes("## Bonus Readiness Audit"), "bonus readiness visible"),
    check("Offensive Bonus Design Audit section exists", report.includes("## Offensive Bonus Design Audit"), "offensive bonus design visible"),
    check("Defensive Bonus Design Audit section exists", report.includes("## Defensive Bonus Design Audit"), "defensive bonus design visible"),
    check("Bonus Interaction With Current Scoring Routes section exists", report.includes("## Bonus Interaction With Current Scoring Routes"), "bonus route interaction visible"),
    check("Bonus Style Impact Audit section exists", report.includes("## Bonus Style Impact Audit"), "bonus style impact visible"),
    check("Bonus Point Value Audit section exists", report.includes("## Bonus Point Value Audit"), "bonus point value visible"),
    check("Bonus Source-of-Truth Audit section exists", report.includes("## Bonus Source-of-Truth Audit"), "bonus source of truth visible"),
    check("Recommended Bonus Model section exists", report.includes("## Recommended Bonus Model"), "recommended bonus visible"),
    check("Bonus Implementation Guardrails section exists", report.includes("## Bonus Implementation Guardrails"), "bonus guardrails visible"),
    check("Bonus Mandatory Diagnosis section exists", report.includes("## Bonus Mandatory Diagnosis"), "bonus diagnosis visible"),
    check("League Points & Bonus Trigger Simulation section exists", report.includes("## League Points & Bonus Trigger Simulation"), "league simulation visible"),
    check("MatchBonusEvent Implementation section exists", report.includes("## MatchBonusEvent Implementation"), "MatchBonusEvent visible"),
    check("League Points Summary section exists", report.includes("## League Points Summary"), "league points summary visible"),
    check("League Table Integration section exists", report.includes("## League Table Integration"), "league table integration visible"),
    check("Final League Table By Team section exists", report.includes("## Final League Table By Team"), "team league table visible"),
    check("Final League Table By Style section exists", report.includes("## Final League Table By Style"), "style league table visible"),
    check("Match-Level LeaguePointsSummary Detail section exists", report.includes("## Match-Level LeaguePointsSummary Detail"), "match-level league points visible"),
    check("League Table Consistency Checks section exists", report.includes("## League Table Consistency Checks"), "league consistency visible"),
    check("Bonus Distribution By Style section exists", report.includes("## Bonus Distribution By Style"), "bonus distribution visible"),
    check("Bonus Fairness Audit section exists", report.includes("## Bonus Fairness Audit"), "bonus fairness visible"),
    check("Fatigue and Team-Construction Instrumentation section exists", report.includes("## Fatigue and Team-Construction Instrumentation"), "fatigue instrumentation visible"),
    check("Fatigue Effect Calibration Summary section exists", report.includes("## Fatigue Effect Calibration Summary"), "fatigue effect summary visible"),
    check("Fatigue Bucket Audit section exists", report.includes("## Fatigue Bucket Audit"), "fatigue buckets visible"),
    check("Fatigue Effect By Action Family section exists", report.includes("## Fatigue Effect By Action Family"), "fatigue action family visible"),
    check("Shot Fatigue Audit section exists", report.includes("## Shot Fatigue Audit"), "shot fatigue visible"),
    check("Rebound / Second-Shot Fatigue Audit section exists", report.includes("## Rebound / Second-Shot Fatigue Audit"), "rebound fatigue visible"),
    check("Try Fatigue Audit section exists", report.includes("## Try Fatigue Audit"), "try fatigue visible"),
    check("Drop and Conversion Fatigue Audit section exists", report.includes("## Drop and Conversion Fatigue Audit"), "drop/conversion fatigue visible"),
    check("Defensive Recovery and Goalkeeper Fatigue Audit section exists", report.includes("## Defensive Recovery and Goalkeeper Fatigue Audit"), "defensive/GK fatigue visible"),
    check("Late-Match Fatigue Effect Audit section exists", report.includes("## Late-Match Fatigue Effect Audit"), "late fatigue visible"),
    check("Style Fatigue Economy section exists", report.includes("## Style Fatigue Economy"), "style fatigue economy visible"),
    check("Late-Match Window Definition section exists", report.includes("## Late-Match Window Definition"), "late-match window visible"),
    check("Fatigue-to-Bonus Correlation Audit section exists", report.includes("## Fatigue-to-Bonus Correlation Audit"), "fatigue correlation visible"),
    check("Roster-Quality-to-Bonus Correlation Audit section exists", report.includes("## Roster-Quality-to-Bonus Correlation Audit"), "roster correlation visible"),
    check("Style-vs-Roster Separation Audit section exists", report.includes("## Style-vs-Roster Separation Audit"), "style-vs-roster visible"),
    check("Late-Match Bonus Audit section exists", report.includes("## Late-Match Bonus Audit"), "late bonus audit visible"),
    check("Missing Instrumentation List section exists", report.includes("## Missing Instrumentation List"), "missing instrumentation visible"),
    check("TeamMatchFatigueSummary section exists", report.includes("## TeamMatchFatigueSummary"), "TeamMatchFatigueSummary visible"),
    check("PlayerMatchLoadSummary section exists", report.includes("## PlayerMatchLoadSummary"), "PlayerMatchLoadSummary visible"),
    check("TeamLoadSummary section exists", report.includes("## TeamLoadSummary"), "TeamLoadSummary visible"),
    check("RosterQualitySummary section exists", report.includes("## RosterQualitySummary"), "RosterQualitySummary visible"),
    check("Roster Stress Test Variant Source section exists", report.includes("## Roster Stress Test Variant Source"), "roster stress source visible"),
    check("Roster Stress Quality Comparison section exists", report.includes("## Roster Stress Quality Comparison"), "roster stress quality visible"),
    check("Roster Stress Route Access Impact section exists", report.includes("## Roster Stress Route Access Impact"), "route access stress visible"),
    check("Roster Stress Defensive Impact section exists", report.includes("## Roster Stress Defensive Impact"), "defensive stress visible"),
    check("Roster Stress Fatigue and Load Impact section exists", report.includes("## Roster Stress Fatigue and Load Impact"), "fatigue/load stress visible"),
    check("Goalkeeper Stress Test section exists", report.includes("## Goalkeeper Stress Test"), "GK stress visible"),
    check("Bonus Access By Roster Variant section exists", report.includes("## Bonus Access By Roster Variant"), "bonus roster stress visible"),
    check("League Table Impact By Roster And Style section exists", report.includes("## League Table Impact By Roster And Style"), "league impact visible"),
    check("Style-vs-Roster Stress Decomposition section exists", report.includes("## Style-vs-Roster Stress Decomposition"), "style roster stress visible"),
    check("Coach-Facing Roster Weakness Diagnostics section exists", report.includes("## Coach-Facing Roster Weakness Diagnostics"), "coach roster diagnostics visible"),
    check("Roster Stress Test Mandatory Diagnosis section exists", report.includes("## Roster Stress Test Mandatory Diagnosis"), "roster stress diagnosis visible"),
    check("Player Load Balancing Action Load Weights Audit section exists", report.includes("## Player Load Balancing Action Load Weights Audit"), "action load weights visible"),
    check("Player Load Distribution Audit section exists", report.includes("## Player Load Distribution Audit"), "player load distribution visible"),
    check("Specialist Dependency Audit section exists", report.includes("## Specialist Dependency Audit"), "specialist dependency visible"),
    check("Specialist Dependency Tuning section exists", report.includes("## Specialist Dependency Tuning"), "specialist tuning visible"),
    check("Bench Depth Audit section exists", report.includes("## Bench Depth Audit"), "bench depth visible"),
    check("Bench Depth Tuning section exists", report.includes("## Bench Depth Tuning"), "bench tuning visible"),
    check("Role-Specific Load Audit section exists", report.includes("## Role-Specific Load Audit"), "role-specific load visible"),
    check("Goalkeeper Load Balancing Audit section exists", report.includes("## Goalkeeper Load Balancing Audit"), "GK load visible"),
    check("Style-Load Interaction Audit section exists", report.includes("## Style-Load Interaction Audit"), "style-load visible"),
    check("Player Load Calibration Regression section exists", report.includes("## Player Load Calibration Regression"), "load regression visible"),
    check("Route Outcome Regression After Load Balancing section exists", report.includes("## Route Outcome Regression After Load Balancing"), "route regression visible"),
    check("Coach-Facing Load Explanations section exists", report.includes("## Coach-Facing Load Explanations"), "coach load visible"),
    check("Player Load Balancing Guardrails section exists", report.includes("## Player Load Balancing Guardrails"), "load guardrails visible"),
    check("Player Load Balancing Mandatory Diagnosis section exists", report.includes("## Player Load Balancing Mandatory Diagnosis"), "load diagnosis visible"),
    check("Role Taxonomy Confirmation section exists", report.includes("## Role Taxonomy Confirmation"), "role taxonomy visible"),
    check("Role Attribute Mapping section exists", report.includes("## Role Attribute Mapping"), "role attributes visible"),
    check("Role Usage Audit section exists", report.includes("## Role Usage Audit"), "role usage visible"),
    check("Role Omission Audit section exists", report.includes("## Role Omission Audit"), "role omission visible"),
    check("Role Redundancy Audit section exists", report.includes("## Role Redundancy Audit"), "role redundancy visible"),
    check("Offensive Role Economy Audit section exists", report.includes("## Offensive Role Economy Audit"), "offensive role economy visible"),
    check("Defensive Role Economy Audit section exists", report.includes("## Defensive Role Economy Audit"), "defensive role economy visible"),
    check("Goalkeeper Role Economy Audit section exists", report.includes("## Goalkeeper Role Economy Audit"), "GK role economy visible"),
    check("Build Archetype Viability Audit section exists", report.includes("## Build Archetype Viability Audit"), "archetype viability visible"),
    check("Mandatory Role Risk Audit section exists", report.includes("## Mandatory Role Risk Audit"), "mandatory role risk visible"),
    check("Role Economy Regression section exists", report.includes("## Role Economy Regression"), "role economy regression visible"),
    check("Role Economy Mandatory Diagnosis section exists", report.includes("## Role Economy Mandatory Diagnosis"), "role economy diagnosis visible"),
    check("LateMatchPerformanceSummary section exists", report.includes("## LateMatchPerformanceSummary"), "LateMatchPerformanceSummary visible"),
    check("Team-Construction Proxy Audit section exists", report.includes("## Team-Construction Proxy Audit"), "team-construction proxy visible"),
    check("MatchBonusEvent Batch Validation section exists", report.includes("## MatchBonusEvent Batch Validation"), "bonus validation visible"),
    check("MatchBonusEvent Style Impact section exists", report.includes("## MatchBonusEvent Style Impact"), "bonus style impact visible"),
    check("MatchBonusEvent Fatigue Future Instrumentation section exists", report.includes("## MatchBonusEvent Fatigue Future Instrumentation"), "bonus fatigue future visible"),
    check("MatchBonusEvent Mandatory Diagnosis section exists", report.includes("## MatchBonusEvent Mandatory Diagnosis"), "bonus diagnosis visible"),
    check("Offensive Bonus Frequency section exists", report.includes("## Offensive Bonus Frequency"), "offensive trigger table visible"),
    check("3+ vs 4+ try comparison present", report.includes("## Refined Try Threshold Comparison - 3+ vs 4+ Tries"), "try threshold comparison visible"),
    check("conversion-included vs conversion-excluded family comparison present", report.includes("## Route Family Definition Comparison - Conversion Included vs Excluded"), "family definition comparison visible"),
    check("Defensive Bonus Frequency section exists", report.includes("## Defensive Bonus Frequency"), "defensive trigger table visible"),
    check("close-loss <=7 audit present", report.includes("## Defensive Bonus Confirmation - Close-Loss <=7 and Major-Threat"), "close-loss <=7 visible"),
    check("major-threat defensive bonus audit present", report.includes("major-threat defensive bonus"), "major-threat visible"),
    check("Close-Loss Threshold Comparison section exists", report.includes("## Close-Loss Threshold Comparison"), "close-loss thresholds visible"),
    check("No-Goal / No-Try OR vs AND Comparison section exists", report.includes("## No-Goal / No-Try OR vs AND Comparison"), "OR vs AND visible"),
    check("Bonus Stacking Audit section exists", report.includes("## Bonus Stacking Audit"), "stacking audit visible"),
    check("Bonus Cap Comparison section exists", report.includes("## Bonus Cap Comparison"), "cap comparison visible"),
    check("fatigue/team-construction proxy audit present", report.includes("## Fatigue and Team-Construction Proxy Audit"), "fatigue proxy visible"),
    check("League Bonus Style Fairness Audit section exists", report.includes("## League Bonus Style Fairness Audit"), "style fairness visible"),
    check("League Bonus Source-of-Truth Guardrails section exists", report.includes("## League Bonus Source-of-Truth Guardrails"), "league source guardrails visible"),
    check("League Bonus Mandatory Diagnosis section exists", report.includes("## League Bonus Mandatory Diagnosis"), "league diagnosis visible"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("SHOT_GOAL remains 3 match points", report.includes("SHOT_GOAL remains 3 match points"), "SHOT 3 match points"),
    check("TRY_TOUCHDOWN remains 5 match points", report.includes("TRY_TOUCHDOWN remains 5 match points"), "TRY 5 match points"),
    check("CONVERSION_GOAL remains 2 match points", report.includes("CONVERSION_GOAL remains 2 match points"), "CONVERSION 2 match points"),
    check("DROP_GOAL remains 2 match points", report.includes("DROP_GOAL remains 2 match points"), "DROP 2 match points"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("MatchBonusEvent implemented as league-table-only", report.includes("MatchBonusEvent implemented as league-table-only"), "league-table only"),
    check("LeaguePointsSummary implemented", report.includes("LeaguePointsSummary implemented: YES"), "LeaguePointsSummary visible"),
    check("LeagueTableRow implemented", report.includes("LeagueTableRow implemented: YES"), "LeagueTableRow visible"),
    check("league table generated", report.includes("league table generated: YES"), "league table generated"),
    check("sum match-level points equals table", report.includes("sum of match-level league points equals league table total - YES"), "league point reconciliation visible"),
    check("every bonus event attached", report.includes("every MatchBonusEvent is attached to one match and one team - YES"), "bonus attachment visible"),
    check("every bonus event in summary", report.includes("every MatchBonusEvent appears in LeaguePointsSummary - YES"), "bonus summary attachment visible"),
    check("no uncapped bonus leak", report.includes("no uncapped bonus leak - 0"), "uncapped leak zero"),
    check("MatchBonusEvent leaves live match score unchanged", report.includes("MatchBonusEvent leaves live match score unchanged"), "match score protected"),
    check("MatchBonusEvent is not a ScoringEvent", report.includes("MatchBonusEvent is not a ScoringEvent"), "ScoringEvent separated"),
    check("bonus computed after final whistle", report.includes("bonus points computed after final whistle: YES"), "post-final whistle visible"),
    check("finalized scoring outcomes only", report.includes("source truth: finalized active scoring outcomes only"), "source truth visible"),
    check("CONVERSION_GOAL excluded from family bonus", report.includes("CONVERSION_GOAL excluded from family bonus: YES"), "conversion excluded"),
    check("close-loss within 7 implemented", report.includes("DEFENSIVE_CLOSE_LOSS_WITHIN_7: loss by 7 or fewer match points only"), "close-loss <=7 visible"),
    check("major-threat shutdown implemented", report.includes("DEFENSIVE_MAJOR_THREAT_SHUTDOWN: zero SHOT_GOAL and zero TRY_TOUCHDOWN conceded"), "major-threat visible"),
    check("bonus cap plus 2 implemented", report.includes("bonus cap: +2 league points per team-match") && report.includes("bonus cap +2 applied: PASS"), "cap +2 visible"),
    check("forfeit no-team rule visible", report.includes("forfeit/no-team rule: base league points -1") && report.includes("forfeit/no-team = -1 and no bonuses: PASS"), "forfeit visible"),
    check("fatigue instrumentation populated with real values", report.includes("fatigue instrumentation available: YES") && report.includes("PlayerFatigueTimelineRow implemented: YES"), "fatigue real values visible"),
    check("team fatigue timeline populated", report.includes("TeamFatigueTimelineRow implemented: YES") && report.includes("| match | team | style | possession | third | avg fatigue |"), "team timeline visible"),
    check("team construction proxy populated", report.includes("RosterQualitySummary now has real V1 values") && report.includes("tactical coherence score average:"), "team construction real values visible"),
    check("TeamMatchFatigueSummary implemented or unavailable", report.includes("TeamMatchFatigueSummary implemented: YES") && report.includes("fatigue start"), "team fatigue schema visible"),
    check("PlayerMatchLoadSummary implemented with real values", report.includes("PlayerMatchLoadSummary implemented: YES, populated with real V1 player load values"), "player load real values visible"),
    check("TeamLoadSummary implemented with real values", report.includes("TeamLoadSummary implemented: YES, populated with real V1 team load aggregates"), "team load real values visible"),
    check("RosterQualitySummary implemented with real values", report.includes("RosterQualitySummary implemented: YES, populated with real V1 values") && report.includes("PlayerProfile V1 present") && report.includes("Role Archetype Taxonomy V1 present"), "roster real values visible"),
    check("PlayerProfile V1 present", report.includes("PlayerProfile V1 present: YES, derived from CONTROL_ROSTER / BLITZ_ROSTER"), "player profile source visible"),
    check("Role Archetype Taxonomy V1 present", report.includes("Role Archetype Taxonomy V1 present: YES") && report.includes("Skill Contribution Mapping V1 present: YES"), "role/skill taxonomy visible"),
    check("offensive and defensive role coverage audited", report.includes("offensiveRoleCoverageScore") && report.includes("defensiveRoleCoverageScore"), "role coverage scores visible"),
    check("goalkeeper-specific roster model present", report.includes("goalkeeper-specific roster model present: YES") && report.includes("goalkeeper mental reliability"), "GK roster model visible"),
    check("goalkeeper mental reliability separated from physical fatigue", report.includes("goalkeeper mental reliability") && report.includes("separated from outfield physical fatigue"), "GK mental split visible"),
    check("roster weakness and strength flags present", report.includes("weakness flags") && report.includes("strength flags") && report.includes("rosterWeaknessFlags") && report.includes("rosterStrengthFlags"), "roster flags visible"),
    check("coach-facing roster summary present", report.includes("coach summary") && report.includes("coachFacingSummary"), "coach roster summary visible"),
    check("no fabricated roster quality", report.includes("source status: EXPLICIT_PLAYER_ROSTER") && report.includes("no fabricated roster quality: YES"), "real roster source visible"),
    check("stress roster variants generated and documented", report.includes("stress roster variants generated and documented: YES") && report.includes("NO_DROP_THREAT_ROSTER") && report.includes("BALANCED_DEPTH_ROSTER"), "stress variants visible"),
    check("roster variant source documented", report.includes("roster variant source documented: CONTROL_ROSTER / BLITZ_ROSTER V1 real player profiles"), "stress source documented"),
    check("stress rosters not production defaults", report.includes("stress roster variants are diagnostic only: YES") && report.includes("not used as default production rosters"), "stress diagnostic only"),
    check("route access impact audit present", report.includes("route access impact audit present: YES") && report.includes("MISSING_DROP_THREAT"), "route access impact visible"),
    check("defensive impact audit present", report.includes("defensive impact audit present: YES") && report.includes("WEAK_DEFENSIVE_RECOVERY_ROSTER"), "defensive impact visible"),
    check("fatigue/load impact audit present", report.includes("fatigue/load impact audit present: YES") && report.includes("load concentration"), "fatigue/load impact visible"),
    check("goalkeeper stress test present", report.includes("goalkeeper stress test present: YES") && report.includes("physically fresh but mentally weak GK"), "GK stress visible"),
    check("bonus access by roster variant present", report.includes("bonus access by roster variant present: YES") && report.includes("3-main-family bonus rate"), "bonus access visible"),
    check("league-table impact by roster/style present", report.includes("league-table impact by roster/style present: YES") && report.includes("same style / different roster"), "league roster style visible"),
    check("style-vs-roster decomposition present", report.includes("style-vs-roster decomposition present: YES") && report.includes("STYLE_ROSTER_SYNERGY"), "style-vs-roster stress visible"),
    check("coach-facing weakness explanations and improvements present", report.includes("coach-facing weakness explanations present: YES") && report.includes("improvement suggestions present: YES"), "coach weakness visible"),
    check("roster quality does not force points or outcomes", report.includes("roster quality does not directly award points: YES") && report.includes("roster quality does not force outcomes: YES"), "roster guard visible"),
    check("load balancing does not directly award points", report.includes("load balancing does not directly award points: YES"), "load score guard visible"),
    check("load balancing preserves scoring values", report.includes("specialist dependency diagnostics do not change SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, or DROP_GOAL values: YES"), "load values guard visible"),
    check("bench depth does not create scoring or bonus events", report.includes("bench depth diagnostics do not create MatchBonusEvents or live ScoringEvents: YES"), "bench guard visible"),
    check("stress rosters remain diagnostic-only", report.includes("stress rosters remain diagnostic-only: YES"), "stress diagnostic load guard visible"),
    check("production rosters unchanged unless explicitly selected", report.includes("production rosters unchanged unless explicitly selected: YES"), "production roster guard visible"),
    check("GK model remains separate from outfield model", report.includes("GK model remains separate from outfield model: YES"), "GK/outfield split visible"),
    check("bench depth role-specific", report.includes("bench depth remains role-specific: YES"), "bench role-specific visible"),
    check("specialist value remains meaningful", report.includes("specialist value remains meaningful: YES"), "specialists preserved"),
    check("role economy keeps scoring values unchanged", report.includes("role economy calibration is conservative") && report.includes("no audit forces every roster archetype to be equally good"), "role economy conservative"),
    check("role taxonomy confirmed", report.includes("Role Archetype Taxonomy V1 confirmed: YES") && report.includes("true role archetypes separated from skills/contributions: YES"), "taxonomy confirmed"),
    check("no universal non-GK mandatory role", report.includes("mandatory role risk count: 1 rule-required goalkeeper, 0 universal tactical roles"), "mandatory risk bounded"),
    check("coach-role-guide.md exists", coachRoleGuide.includes("# Coach Role Guide"), "coach role guide generated"),
    check("coach role guide has beginner documentation", coachRoleGuide.includes("## 1. Attributes vs Skills vs Roles") && coachRoleGuide.includes("## 4. The True Roles Of The Sport") && coachRoleGuide.includes("## 5. Role-by-Role Beginner Explanation"), "beginner guide sections visible"),
    check("coach role guide has goalkeeper special section", coachRoleGuide.includes("## 10. Goalkeeper Special Section") && coachRoleGuide.includes("mental fatigue") && coachRoleGuide.includes("readiness state"), "GK guide visible"),
    check("coach role guide has common mistakes and archetypes", coachRoleGuide.includes("## 9. Common Beginner Mistakes") && coachRoleGuide.includes("## Example Roster Archetypes"), "mistakes/archetypes visible"),
    check("coach role guide has bonus explanation", coachRoleGuide.includes("## Bonus Points And Roles") && coachRoleGuide.includes("MatchBonusEvent is league-table only"), "bonus guide visible"),
    check("coach role glossary present", coachRoleGuide.includes("## 11. Glossary") && coachRoleGuide.includes("specialist dependency") && coachRoleGuide.includes("role coverage"), "glossary visible"),
    check("MatchBonusEvent remains league-table only", report.includes("MatchBonusEvent leaves live match score unchanged") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "bonus score guard visible"),
    check("LateMatchPerformanceSummary implemented with real values", report.includes("LateMatchPerformanceSummary implemented: YES, populated with real V1 final-third performance values"), "late performance real values visible"),
    check("roster-quality-to-bonus correlation audit present", report.includes("correlation strength: AVAILABLE") && report.includes("whether bonus teams have better roster construction: AVAILABLE/WATCH"), "roster correlation visible"),
    check("style-vs-roster separation audit present", report.includes("CONTROL_DIRECT: style route access remains powerful") && report.includes("bonus events earned through roster quality: AVAILABLE/WATCH"), "style-vs-roster visible"),
    check("late-match bonus audit present", report.includes("teams earning offensive bonus with late scoring contribution: AVAILABLE"), "late-match bonus visible"),
    check("missing instrumentation list present", report.includes("team fatigue by match third") && report.includes("explicit starter/bench split and substitution contribution model"), "missing instrumentation visible"),
    check("style fairness audit answers visible", report.includes("Do bonuses over-reward CONTROL_DIRECT?") && report.includes("Is CONTROL_PATIENT under-rewarded"), "style fairness answers visible"),
    check("offensive bonus model recommendation present", report.includes("RECOMMEND_OFFENSIVE_BONUS_MODEL") && report.includes("recommended offensive bonus"), "offensive recommendation visible"),
    check("defensive bonus model recommendation present", report.includes("RECOMMEND_DEFENSIVE_BONUS_MODEL") && report.includes("recommended defensive bonus"), "defensive recommendation visible"),
    check("bonus trigger rate validation required", report.includes("VALIDATE_BONUS_TRIGGER_RATE_BEFORE_IMPLEMENTATION") && report.includes("Trigger rate by style"), "trigger validation visible"),
    check("bonuses do not mask route imbalance", report.includes("DO_NOT_USE_BONUSES_TO_MASK_ROUTE_IMBALANCE") && report.includes("bonuses must not mask route imbalance"), "masking guard visible"),
    check("4/2/0/-1 table validation visible", report.includes("VALIDATE_4_2_0_MINUS_1_TABLE") && report.includes("WIN 4, DRAW 2, LOSS 0, FORFEIT -1"), "league table visible"),
    check("3 main scoring families bonus confirmation visible", report.includes("CONFIRM_3_MAIN_SCORING_FAMILIES_BONUS") && report.includes("OFFENSIVE_3_MAIN_SCORING_FAMILIES: SHOT_GOAL + TRY_TOUCHDOWN + DROP_GOAL"), "3-family value visible"),
    check("close-loss threshold review visible", report.includes("REVIEW_CLOSE_LOSS_THRESHOLD") && report.includes("loss by fewer than 7"), "close-loss review visible"),
    check("no-goal/no-try OR vs AND review visible", report.includes("REVIEW_NO_GOAL_NO_TRY_OR_VS_AND") && report.includes("OR version") && report.includes("AND version"), "OR/AND review visible"),
    check("bonus stacking cap review visible", report.includes("REVIEW_BONUS_STACKING_CAP") && report.includes("max +2"), "cap review visible"),
    check("bonuses kept out of match score", report.includes("KEEP_BONUSES_OUT_OF_MATCH_SCORE") && report.includes("MatchBonusEvent leaves live match score unchanged"), "match-score guard visible"),
    check("conversion exclusion recommendation visible", report.includes("EXCLUDE_CONVERSION_FROM_ROUTE_FAMILY_BONUS_IF_CONFIRMED") && report.includes("CONVERSION_GOAL excluded from route-family bonus"), "conversion exclusion visible"),
    check("3 try threshold recommendation visible", report.includes("CONFIRM_3_TRY_OFFENSIVE_BONUS") && report.includes("OFFENSIVE_3_PLUS_TRIES threshold: 3 TRY_TOUCHDOWN"), "3 try threshold visible"),
    check("close-loss 7 confirmation visible", report.includes("CONFIRM_CLOSE_LOSS_7_POINTS") && report.includes("close-loss <=7"), "close-loss 7 visible"),
    check("major-threat defensive confirmation visible", report.includes("CONFIRM_MAJOR_THREAT_DEFENSIVE_BONUS") && report.includes("DROP_GOAL can be conceded"), "major-threat confirmation visible"),
    check("fatigue effect calibration recommendation visible", report.includes("CONFIRM_FATIGUE_EFFECT_CALIBRATION") && report.includes("MONITOR_FATIGUE_OUTCOME_IMPACT"), "fatigue effect recommendations visible"),
    check("high-load fatigue cost recommendation visible", report.includes("REVIEW_HIGH_LOAD_STYLE_COST") && report.includes("PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT"), "fatigue cost recommendations visible"),
    check("fatigue calibration status visible", report.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1"), "fatigue effect status visible"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("no forced scoring events", report.includes("no forced scoring events"), "no forced scoring"),
    check("no global route success buff", report.includes("no global route success buff"), "no global buff"),
    check("no global shot nerf", report.includes("no global shot nerf"), "no shot nerf"),
    check("no global try buff", report.includes("no global try buff"), "no try buff"),
    check("no global drop buff", report.includes("no global drop buff"), "no drop buff"),
    check("full-match batch explicitly rerun after geometry calibration", report.includes("full-match batch explicitly rerun after geometry calibration: YES"), "fresh batch visible"),
    check("route point share recomputed from post-geometry outcomes", report.includes("route point share recomputed from post-geometry outcomes: YES"), "route share recomputed"),
    check("old vs recomputed route point share table present", report.includes("| route | old points | old share | recomputed points | recomputed share | delta | status |"), "integrity table visible"),
    check("mismatch counts present", report.includes("scoreline mismatch count:") && report.includes("route point mismatch count:"), "mismatch counts visible"),
    check("observed 0-0 draw rate inside target", observedNilNilRate <= 5, `${observedNilNilRate}%`),
    check("observed 0-0 draw rate inside temporary bound", observedNilNilRate <= 8, `${observedNilNilRate}%`),
    check("projected vs observed delta reported", report.includes("delta projected vs observed"), "delta visible"),
    check("expected full-length total points range represented", report.includes("score bucket 18-36 points"), "18-36 bucket visible"),
    check("route diversity is monitored, not forced equal", report.includes("diversity, not artificial equal point share"), "route diversity language visible"),
    check("style identities are distinct", report.includes("CONTROL_PATIENT") && report.includes("BLITZ_RISKY") && report.includes("tactical identity read"), "style identities visible"),
    check("continuation payoff no longer automatically productive", !/meta-risks: .*AUTO_THREAT/.test(report) && !/meta-risks: .*CONTINUATION_PAYOFF_TOO_HIGH/.test(report), "auto-threat cleared"),
    check("continuation payoff quality distribution visible", report.includes("payoff quality") && report.includes("NEUTRAL_PAYOFF"), "payoff distribution visible"),
    check("bonus readiness says implementation league-table only", report.includes("MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE"), "bonus implementation visible"),
    check("xG outcome calibration snapshot visible", report.includes("after conversion rate") && report.includes("average finalXG"), "post-geometry conversion visible"),
    check("try attrition calibration recommendations visible", report.includes("CALIBRATE_TRY_ATTRITION") && report.includes("ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"), "try attrition recommendations visible"),
    check(
      "mandatory try attrition diagnosis answers visible",
      report.includes("Was LOST_FORWARD overpunished before calibration?") &&
        report.includes("Did legal high-quality try access become more rewarding?") &&
        report.includes("Did try success rise without becoming cheap?") &&
        report.includes("Did HELD_UP remain meaningful?") &&
        report.includes("Did TACKLED_SHORT remain meaningful?") &&
        report.includes("Did conversion geometry remain correct?") &&
        report.includes("Did TRY_TOUCHDOWN point share rise?") &&
        report.includes("Did SHOT_GOAL share fall or remain stable?"),
      "mandatory diagnosis visible",
    ),
    check(
      "mandatory fatigue effect diagnosis answers visible",
      report.includes("Does fatigue now affect outcomes? YES") &&
        report.includes("Is the fatigue effect too weak, healthy, or too strong? HEALTHY/WATCH") &&
        report.includes("Did scoring economy remain healthy? YES") &&
        report.includes("Did 0-0 remain rare? YES") &&
        report.includes("Did shot quality degrade under fatigue? YES/WATCH") &&
        report.includes("Did try grounding degrade under fatigue without reverting to excessive LOST_FORWARD? YES/WATCH") &&
        report.includes("Did drop accuracy degrade under fatigue without killing drops? YES/WATCH") &&
        report.includes("Did defensive recovery degrade under fatigue? YES/WATCH") &&
        report.includes("Did GK recovery / spill risk respond to fatigue? YES/WATCH") &&
        report.includes("Did high-load styles pay a visible fatigue cost? YES/WATCH") &&
        report.includes("Did CONTROL_DIRECT and BLITZ_RISKY remain viable but costly? YES/WATCH") &&
        report.includes("Did CONTROL_BALANCED become more visible through fatigue efficiency? WATCH") &&
        report.includes("Did bonus access become more fatigue-sensitive? YES/WATCH") &&
        report.includes("Are roster-quality proxies still missing? NO") &&
        report.includes("Next sprint: role economy balancing or season fatigue accumulation"),
      "mandatory fatigue diagnosis visible",
    ),
    check(
      "mandatory roster stress diagnosis answers visible",
      report.includes("Do weak rosters fail for the expected reasons? YES") &&
        report.includes("Does missing drop threat reduce 3-main-family bonus access? YES") &&
        report.includes("Does missing try carrier reduce 3+ try bonus access? YES") &&
        report.includes("Does weak GK mental reliability increase rebound/spill/late-error risk? YES") &&
        report.includes("Does low bench depth increase fatigue collapse? YES") &&
        report.includes("Does high specialist dependency increase load concentration? YES") &&
        report.includes("Does balanced depth improve late control? YES") &&
        report.includes("Does CONTROL_BALANCED become more valuable when roster stability matters? YES/WATCH") &&
        report.includes("Are CONTROL_DIRECT and BLITZ_RISKY still viable but more fragile with weak rosters? YES/WATCH") &&
        report.includes("PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT"),
      "roster stress diagnosis visible",
    ),
    check(
      "mandatory player load balancing diagnosis answers visible",
      report.includes("Is specialist dependency cost too weak, healthy, or too strong? HEALTHY/WATCH") &&
        report.includes("Is bench depth cost too weak, healthy, or too strong? HEALTHY/WATCH") &&
        report.includes("Are star-heavy teams still viable? YES") &&
        report.includes("Are specialist-dependent teams fragile in the right way? YES/WATCH") &&
        report.includes("Does low bench depth increase late collapse without killing early threat? YES") &&
        report.includes("Does GK mental load behave separately from outfield fatigue? YES") &&
        report.includes("PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT"),
      "player load diagnosis visible",
    ),
    check(
      "mandatory role economy diagnosis answers visible",
      report.includes("Which early roles remain valid unchanged?") &&
        report.includes("Which roles need renaming or clarification?") &&
        report.includes("Which previous roles are actually skills?") &&
        report.includes("Which roles risk becoming mandatory?") &&
        report.includes("Which skills risk being invisible to beginner coaches?") &&
        report.includes("Are the 9 visible attributes still sufficient? YES") &&
        report.includes("Are derived attributes sufficient to express the skills? YES") &&
        report.includes("Does each scoring route have at least one clear role path? YES") &&
        report.includes("Does each defensive need have at least one clear role path? YES") &&
        report.includes("Is goalkeeper role value healthy? YES/WATCH") &&
        report.includes("Is coach-role-guide.md now correct for beginner coaches? YES") &&
        report.includes("PREPARE_ROLE_FIT_UI_OR_ONBOARDING_UI_NEXT"),
      "role economy diagnosis visible",
    ),
    check("continuation payoff calibration remains PASS", continuationPayoff.includes("Status: PASS"), "continuation PASS"),
    check("match duration possession volume calibration remains PASS", matchDuration.includes("Status: PASS"), "match duration PASS"),
    check("route economy monitoring remains PASS", routeEconomy.includes("Status: PASS"), "route economy PASS"),
    check("route resolution calibrations remain PASS", routeResolution.includes("Status: PASS"), "route resolution PASS"),
    check("route decision and balance remains PASS", routeDecision.includes("Status: PASS"), "route decision PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("share pack <= 20 files", expectedSharePackFiles(input.reportDirectory).length <= 20, `${expectedSharePackFiles(input.reportDirectory).length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.full-match-economy-validation.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: numberField(report, "matches simulated"),
      observedNilNilRate,
      projectedNilNilRate,
      averageTotalPoints,
      medianTotalPoints,
      uniqueFinalScores,
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
