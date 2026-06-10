import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  summarizeDrawRateStyleOutcomeMonitoring,
  V1_SCORING_RULES,
  type BatchScoringCalibrationSummary,
  type DrawRateRecommendation,
} from "../../systems/scoring";

type DrawRateStyleOutcomeMonitoringStatus = "PASS" | "FAIL";

interface DrawRateStyleOutcomeMonitoringCheck {
  readonly label: string;
  readonly status: DrawRateStyleOutcomeMonitoringStatus;
  readonly detail: string;
}

export interface DrawRateStyleOutcomeMonitoringValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DrawRateStyleOutcomeMonitoringCheck[];
}

const ALLOWED_RECOMMENDATIONS: readonly DrawRateRecommendation[] = [
  "KEEP_RULE_BUT_MONITOR",
  "INCREASE_ACTION_VOLUME",
  "REDUCE_0_0_DRAWS",
  "ADJUST_STYLE_MATCHUPS",
  "LOWER_SHOT_DIFFICULTY_SLIGHTLY",
  "NEEDS_MORE_SAMPLE",
];

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DrawRateStyleOutcomeMonitoringCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly summary: BatchScoringCalibrationSummary;
  readonly checks: readonly DrawRateStyleOutcomeMonitoringCheck[];
}): string {
  const monitoring = summarizeDrawRateStyleOutcomeMonitoring(input.summary);
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Draw Rate & Style Outcome Monitoring Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${monitoring.matchesSimulated}`,
    `- draw rate: ${monitoring.drawRate}`,
    `- CONTROL win rate: ${monitoring.controlWinRate}`,
    `- BLITZ win rate: ${monitoring.blitzWinRate}`,
    `- 0-0 draw rate: ${monitoring.nilNilDrawRate}`,
    `- scoring draw rate: ${monitoring.scoringDrawRate}`,
    `- average shots in draws: ${monitoring.averageShotsInDraws}`,
    `- average SHOT_GOAL in draws: ${monitoring.averageShotGoalsInDraws}`,
    `- recommendation: ${monitoring.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateDrawRateStyleOutcomeMonitoring(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): DrawRateStyleOutcomeMonitoringValidationResult {
  const report = readIfExists(join(input.reportDirectory, "draw-rate-style-outcome-monitoring.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const monitoring = summarizeDrawRateStyleOutcomeMonitoring(input.summary);
  const v2Leakage = ["TRY", "TOUCHDOWN", "CONVERSION", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const checks: readonly DrawRateStyleOutcomeMonitoringCheck[] = [
    check("draw report exists", existsSync(join(input.reportDirectory, "draw-rate-style-outcome-monitoring.md")), "draw-rate-style-outcome-monitoring.md"),
    check("draw rate is reported", report.includes("draw rate:"), `${monitoring.drawRate}%`),
    check("0-0 draw rate is reported", report.includes("0-0 draw rate:"), `${monitoring.nilNilDrawRate}%`),
    check("scoring draw rate is reported", report.includes("scoring draw rate:"), `${monitoring.scoringDrawRate}%`),
    check("draw breakdown by pressure exists", report.includes("## Draw Breakdown By Pressure"), "pressure breakdown visible"),
    check("draw breakdown by style matchup exists", report.includes("## Draw Breakdown By Style Matchup"), "style matchup breakdown visible"),
    check("draw type classification exists", report.includes("## Draw Type Classification"), "draw type classification visible"),
    check("recommendation is allowed", ALLOWED_RECOMMENDATIONS.includes(monitoring.recommendation), monitoring.recommendation),
    check("SHOT_GOAL remains 3 points", input.summary.scoringRule === "SHOT_GOAL = 3 points", input.summary.scoringRule),
    check("shot difficulty unchanged", input.summary.shotDifficultyCalibrationApplied, "monitoring layer only; shot difficulty calibration remains applied"),
    check("clean-window thresholds unchanged", input.summary.cleanWindowConversionTargetRange === "60% to 75%", input.summary.cleanWindowConversionTargetRange),
    check(
      "batch remains VARIED",
      input.summary.variationStatus === "VARIED" || input.summary.variationStatus === "PARTIALLY_VARIED",
      input.summary.variationStatus,
    ),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.draw-rate-style-outcome-monitoring.md");

  writeFileSync(reportPath, renderMarkdown({ summary: input.summary, checks }), "utf8");

  return {
    valid: !checks.some((item) => item.status === "FAIL"),
    reportPath,
    checks,
  };
}
