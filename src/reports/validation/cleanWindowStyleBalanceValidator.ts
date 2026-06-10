import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { V1_SCORING_RULES, type BatchScoringCalibrationSummary } from "../../systems/scoring";

type CleanWindowStyleBalanceStatus = "PASS" | "FAIL";

interface CleanWindowStyleBalanceCheck {
  readonly label: string;
  readonly status: CleanWindowStyleBalanceStatus;
  readonly detail: string;
}

export interface CleanWindowStyleBalanceValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CleanWindowStyleBalanceCheck[];
}

const PREVIOUS_CLEAN_WINDOW_CONVERSION = 95;

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): CleanWindowStyleBalanceCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly summary: BatchScoringCalibrationSummary;
  readonly checks: readonly CleanWindowStyleBalanceCheck[];
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Clean Window & Style Balance Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- previous clean-window conversion: ${PREVIOUS_CLEAN_WINDOW_CONVERSION}`,
    `- new clean-window conversion: ${input.summary.cleanWindowConversionRate}`,
    `- global conversion: ${input.summary.averageConversionRate}`,
    `- CONTROL win rate: ${input.summary.controlWinRate}`,
    `- BLITZ win rate: ${input.summary.blitzWinRate}`,
    `- draw rate: ${input.summary.drawRate}`,
    `- style balance status: ${input.summary.styleBalanceStatus}`,
    `- recommendation: ${input.summary.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCleanWindowStyleBalance(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): CleanWindowStyleBalanceValidationResult {
  const report = readIfExists(join(input.reportDirectory, "clean-window-style-balance.md"));
  const shotDifficultyReport = readIfExists(join(input.reportDirectory, "shot-difficulty-calibration.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const scenarioSeedVariation = readIfExists(join(input.reportDirectory, "validation.scenario-seed-variation.md"));
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.filter((activeRule) => activeRule.activeInVersion === "V1").map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const teamBalanceAcceptable =
    (input.summary.controlWinRate >= 25 && input.summary.controlWinRate <= 60 && input.summary.blitzWinRate >= 25 && input.summary.blitzWinRate <= 60) ||
    input.summary.styleBalanceStatus !== "BALANCED";
  const checks: readonly CleanWindowStyleBalanceCheck[] = [
    check("SHOT_GOAL remains 3 points", input.summary.scoringRule === "SHOT_GOAL = 3 points", input.summary.scoringRule),
    check("score unit remains POINTS", input.summary.scoreUnit === "POINTS", input.summary.scoreUnit),
    check("V2 scoring extensions remain outside clean-window thresholds", v2Leakage === 0, `${v2Leakage}`),
    check("clean-window conversion below previous 95%", input.summary.cleanWindowConversionRate < PREVIOUS_CLEAN_WINDOW_CONVERSION, `${input.summary.cleanWindowConversionRate}%`),
    check("clean-window conversion target is visible", report.includes("target range: 60%-75%") && shotDifficultyReport.includes("target range: 60%-75%"), "target visible"),
    check(
      "global conversion is <= 40% or recommendation explains remaining excess",
      input.summary.averageConversionRate <= 40 || input.summary.recommendation === "RAISE_SHOT_DIFFICULTY_MORE",
      `${input.summary.averageConversionRate}% / ${input.summary.recommendation}`,
    ),
    check("forced-shot conversion remains <= 10%", input.summary.forcedShotConversionRate <= 10, `${input.summary.forcedShotConversionRate}%`),
    check("blowout rate <= 15%", input.summary.blowoutRate <= 15, `${input.summary.blowoutRate}%`),
    check(
      "team win rates are not severely imbalanced, or style balance warning is explicit",
      teamBalanceAcceptable,
      `${input.summary.controlWinRate}% CONTROL / ${input.summary.blitzWinRate}% BLITZ / ${input.summary.styleBalanceStatus}`,
    ),
    check(
      "batch remains VARIED",
      input.summary.variationStatus === "VARIED" || input.summary.variationStatus === "PARTIALLY_VARIED",
      input.summary.variationStatus,
    ),
    check("no semantic contract regressions", scenarioSeedVariation.includes("Status: PASS"), "scenario seed variation PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.clean-window-style-balance.md");

  writeFileSync(reportPath, renderMarkdown({ summary: input.summary, checks }), "utf8");

  return {
    valid: !checks.some((item) => item.status === "FAIL"),
    reportPath,
    checks,
  };
}
