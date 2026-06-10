import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { V1_SCORING_RULES, type BatchScoringCalibrationSummary } from "../../systems/scoring";

type ShotDifficultyStatus = "PASS" | "FAIL";

interface ShotDifficultyCheck {
  readonly label: string;
  readonly status: ShotDifficultyStatus;
  readonly detail: string;
}

export interface ShotDifficultyCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ShotDifficultyCheck[];
}

const PREVIOUS_CONVERSION_RATE = 65;
const PREVIOUS_SHOT_GOALS_PER_MATCH = 4;
const PREVIOUS_HIGH_QUALITY_MISS_RATE = 1;

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ShotDifficultyCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly summary: BatchScoringCalibrationSummary;
  readonly checks: readonly ShotDifficultyCheck[];
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Shot Difficulty Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- previous conversion rate: ${PREVIOUS_CONVERSION_RATE}`,
    `- new conversion rate: ${input.summary.averageConversionRate}`,
    `- previous SHOT_GOAL per match: ${PREVIOUS_SHOT_GOALS_PER_MATCH}`,
    `- new SHOT_GOAL per match: ${input.summary.averageShotGoalsPerMatch}`,
    `- previous high-quality miss rate: ${PREVIOUS_HIGH_QUALITY_MISS_RATE}`,
    `- new high-quality miss rate: ${input.summary.highQualityMissRate}`,
    `- recommendation: ${input.summary.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateShotDifficultyCalibration(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ShotDifficultyCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "shot-difficulty-calibration.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const scenarioSeedVariation = readIfExists(join(input.reportDirectory, "validation.scenario-seed-variation.md"));
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.filter((activeRule) => activeRule.activeInVersion === "V1").map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const checks: readonly ShotDifficultyCheck[] = [
    check("shot difficulty calibration report exists", report.length > 0, "shot-difficulty-calibration.md present"),
    check("SHOT_GOAL remains 3 points", input.summary.scoringRule === "SHOT_GOAL = 3 points", input.summary.scoringRule),
    check("score unit remains POINTS", input.summary.scoreUnit === "POINTS", input.summary.scoreUnit),
    check("V2 scoring extensions remain outside shot difficulty thresholds", v2Leakage === 0, `${v2Leakage}`),
    check(
      "batch scenario variation remains VARIED or PARTIALLY_VARIED",
      input.summary.scenarioVariation.scenarioDiversityStatus === "VARIED" ||
        input.summary.scenarioVariation.scenarioDiversityStatus === "PARTIALLY_VARIED",
      input.summary.scenarioVariation.scenarioDiversityStatus,
    ),
    check("conversion rate is below previous 65%", input.summary.averageConversionRate < PREVIOUS_CONVERSION_RATE, `${input.summary.averageConversionRate}%`),
    check("average SHOT_GOAL per match is below previous 4", input.summary.averageShotGoalsPerMatch < PREVIOUS_SHOT_GOALS_PER_MATCH, `${input.summary.averageShotGoalsPerMatch}`),
    check("low-quality goal rate <= 5%", input.summary.lowQualityGoalRate <= 5, `${input.summary.lowQualityGoalRate}%`),
    check("high-quality miss rate increased above previous 1%", input.summary.highQualityMissRate > PREVIOUS_HIGH_QUALITY_MISS_RATE, `${input.summary.highQualityMissRate}%`),
    check("blowout rate <= 15%", input.summary.blowoutRate <= 15, `${input.summary.blowoutRate}%`),
    check("no semantic contract regressions", scenarioSeedVariation.includes("Status: PASS"), "scenario seed variation PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.shot-difficulty-calibration.md");

  writeFileSync(reportPath, renderMarkdown({ summary: input.summary, checks }), "utf8");

  return {
    valid: !checks.some((item) => item.status === "FAIL"),
    reportPath,
    checks,
  };
}
