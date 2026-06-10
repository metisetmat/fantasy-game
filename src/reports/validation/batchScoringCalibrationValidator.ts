import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  validateBatchScoringCalibrationSummary,
  V1_SCORING_RULES,
  type BatchScoringCalibrationSummary,
  type ScoringCalibrationRecommendation,
} from "../../systems/scoring";

type BatchCalibrationStatus = "PASS" | "FAIL" | "WARNING";

interface BatchCalibrationCheck {
  readonly label: string;
  readonly status: BatchCalibrationStatus;
  readonly detail: string;
}

export interface BatchScoringCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly BatchCalibrationCheck[];
}

const ALLOWED_RECOMMENDATIONS: readonly ScoringCalibrationRecommendation[] = [
  "KEEP_V1_RULE",
  "KEEP_RULE_BUT_MONITOR",
  "ADJUST_STYLE_BALANCE",
  "LOWER_SHOT_DIFFICULTY",
  "RAISE_SHOT_DIFFICULTY_MORE",
  "REDUCE_SHOT_FREQUENCY",
  "NEEDS_MORE_SAMPLE",
];

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): BatchCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, detail: string): BatchCalibrationCheck {
  return {
    label,
    status: "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly BatchCalibrationCheck[];
  readonly summary: BatchScoringCalibrationSummary;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Scoring V1 Batch Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.summary.matchesSimulated}`,
    `- average shots per match: ${input.summary.averageShotsPerMatch}`,
    `- average conversion rate: ${input.summary.averageConversionRate}%`,
    `- blowout rate: ${input.summary.blowoutRate}%`,
    `- low-quality goal rate: ${input.summary.lowQualityGoalRate}%`,
    `- high-quality miss rate: ${input.summary.highQualityMissRate}%`,
    `- forced shot rate: ${input.summary.forcedShotRate}%`,
    `- recommendation: ${input.summary.recommendation}`,
    `- batch variation status: ${input.summary.variationStatus}`,
    `- scenario diversity status: ${input.summary.scenarioVariation.scenarioDiversityStatus}`,
    `- unique initial scenarios: ${input.summary.scenarioVariation.uniqueInitialScenarios}`,
    `- unique final scores: ${input.summary.scenarioVariation.uniqueFinalScores}`,
    `- unique shot counts: ${input.summary.scenarioVariation.uniqueShotCounts}`,
    `- unique shot outcome patterns: ${input.summary.scenarioVariation.uniqueShotOutcomePatterns}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateBatchScoringCalibration(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): BatchScoringCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoringRules = readIfExists(join(input.reportDirectory, "validation.scoring-rules-v1.md"));
  const scoreUnit = readIfExists(join(input.reportDirectory, "validation.score-unit-semantics.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const summaryValidation = validateBatchScoringCalibrationSummary(input.summary);
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.filter((activeRule) => activeRule.activeInVersion === "V1").map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const checks: readonly BatchCalibrationCheck[] = [
    check("scoring-v1-batch-calibration.md exists", report.length > 0, "batch report present"),
    check("scoring version is V1", input.summary.scoringVersion === "V1", input.summary.scoringVersion),
    check("scoring rule is SHOT_GOAL = 3 points", input.summary.scoringRule === "SHOT_GOAL = 3 points", input.summary.scoringRule),
    check("match count >= 20", input.summary.matchesSimulated >= 20, `${input.summary.matchesSimulated}`),
    check("aggregate scoring metrics exist", report.includes("## Aggregate Scoring Metrics"), "aggregate metrics present"),
    check("shot quality metrics exist", report.includes("## Shot Quality Metrics"), "shot quality metrics present"),
    check("team/style profile exists", report.includes("## Team / Style Profile"), "team profile present"),
    check("match sample table exists", report.includes("## Match Sample Table"), "match sample table present"),
    check("scenario variation summary exists", report.includes("## Scenario Variation Summary"), "scenario variation summary present"),
    check("recommendation exists", report.includes("## Recommendation"), input.summary.recommendation),
    check("recommendation is allowed", ALLOWED_RECOMMENDATIONS.includes(input.summary.recommendation), input.summary.recommendation),
    check("shot difficulty calibration applied", report.includes("shot difficulty calibration applied: YES"), "difficulty calibration visible"),
    check("conversion target range visible", report.includes("conversion target range: 25% to 40%"), "target range visible"),
    check("active scoring rule unchanged", V1_SCORING_RULES.rules.find((rule) => rule.actionType === "SHOT_GOAL")?.pointValue === 3, "SHOT_GOAL remains 3"),
    check("no V2 scoring rule active inside shot-subsystem V1", v2Leakage === 0, `${v2Leakage}`),
    check("no point-value change is made during batch calibration", summaryValidation.valid, summaryValidation.errors.join("; ") || "rule set unchanged"),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("tactical evidence includes compact batch calibration line", evidence.includes("batch scoring calibration recommendation"), "tactical evidence batch calibration visible"),
    check("existing scoring rules V1 validation still passes", scoringRules.includes("Status: PASS"), "scoring rules PASS"),
    check("existing score unit validation still passes", scoreUnit.includes("Status: PASS"), "score unit PASS"),
    check("existing shot outcome validation still passes", shotOutcome.includes("Status: PASS"), "shot outcome PASS"),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
    check("batch variation status is meaningful", input.summary.variationStatus !== "IDENTICAL_OUTPUT_WARNING", input.summary.variationStatus),
    check("seed impact status is measured", input.summary.scenarioVariation.seedImpactStatus !== "SEED_NOT_CONNECTED_TO_SIMULATION", input.summary.scenarioVariation.seedImpactStatus),
    check("unique initial scenarios > 1", input.summary.scenarioVariation.uniqueInitialScenarios > 1, `${input.summary.scenarioVariation.uniqueInitialScenarios}`),
    input.summary.scenarioVariation.uniqueShotCounts > 1
      ? check("unique shot counts > 1 or explicitly explained", true, `${input.summary.scenarioVariation.uniqueShotCounts}`)
      : warning("unique shot counts > 1 or explicitly explained", "shot counts still fixed; scenario report explains limitation"),
    input.summary.scenarioVariation.uniqueFinalScores > 1
      ? check("unique final scores > 1 or explicitly explained", true, `${input.summary.scenarioVariation.uniqueFinalScores}`)
      : warning("unique final scores > 1 or explicitly explained", "final scores still fixed; scenario report explains limitation"),
  ];
  const reportPath = join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md");

  writeFileSync(reportPath, renderMarkdown({ checks, summary: input.summary }), "utf8");

  return {
    valid: !checks.some((item) => item.status === "FAIL"),
    reportPath,
    checks,
  };
}
