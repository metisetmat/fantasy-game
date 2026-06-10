import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import {
  scoringRuleLabel,
  SCORING_VERSION,
  summarizeScoringV1GameplayCalibration,
  V1_SCORING_RULES,
  type ScoringCalibrationRecommendation,
} from "../../systems/scoring";

type CalibrationValidationStatus = "PASS" | "FAIL";

interface CalibrationCheck {
  readonly label: string;
  readonly status: CalibrationValidationStatus;
  readonly detail: string;
}

export interface ScoringV1GameplayCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CalibrationCheck[];
}

const ALLOWED_RECOMMENDATIONS: readonly ScoringCalibrationRecommendation[] = [
  "KEEP_V1_RULE",
  "KEEP_RULE_BUT_MONITOR",
  "ADJUST_STYLE_BALANCE",
  "LOWER_SHOT_GOAL_VALUE",
  "LOWER_SHOT_DIFFICULTY",
  "RAISE_SHOT_DIFFICULTY",
  "RAISE_SHOT_DIFFICULTY_MORE",
  "REDUCE_SHOT_FREQUENCY",
  "NEEDS_MORE_SAMPLE",
];

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): CalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly CalibrationCheck[];
  readonly totalShots: number;
  readonly shotGoals: number;
  readonly conversionRate: number;
  readonly lowQualityGoals: number;
  readonly highQualityMisses: number;
  readonly forcedShotCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Scoring V1 Gameplay Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- total shots: ${input.totalShots}`,
    `- shot goals: ${input.shotGoals}`,
    `- conversion rate: ${input.conversionRate}%`,
    `- low-quality goals: ${input.lowQualityGoals}`,
    `- high-quality misses: ${input.highQualityMisses}`,
    `- forced shot count: ${input.forcedShotCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScoringV1GameplayCalibration(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): ScoringV1GameplayCalibrationValidationResult {
  const reportPath = join(input.reportDirectory, "scoring-v1-gameplay-calibration.md");
  const report = readIfExists(reportPath);
  const scoringRules = readIfExists(join(input.reportDirectory, "validation.scoring-rules-v1.md"));
  const batchCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const batchCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const scoreUnit = readIfExists(join(input.reportDirectory, "validation.score-unit-semantics.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const calibration = summarizeScoringV1GameplayCalibration(input);
  const activeV2RuleLeakageCount = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.filter((activeRule) => activeRule.activeInVersion === "V1").map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const checks: readonly CalibrationCheck[] = [
    check("scoring-v1-gameplay-calibration.md exists", report.length > 0, reportPath),
    check("scoring V1 batch calibration validation passes", batchCalibrationValidation.length === 0 || batchCalibrationValidation.includes("Status: PASS"), batchCalibrationValidation.length === 0 ? "pending during first validation pass" : "batch calibration PASS"),
    check("batch calibration report exists", batchCalibrationReport.length > 0, "scoring-v1-batch-calibration.md present"),
    check("active scoring rule unchanged", V1_SCORING_RULES.rules.find((rule) => rule.actionType === "SHOT_GOAL")?.pointValue === 3, "SHOT_GOAL remains 3"),
    check("no V2 scoring rule is active inside shot-subsystem V1", activeV2RuleLeakageCount === 0, `${activeV2RuleLeakageCount}`),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("scoring version is V1", report.includes(`scoring version: ${SCORING_VERSION}`), SCORING_VERSION),
    check("scoring rule is SHOT_GOAL = 3 points", report.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("total shots count is present", report.includes("total shots:"), `${calibration.totalShots}`),
    check("shot goals count is present", report.includes("shot goals:"), `${calibration.shotGoals}`),
    check("conversion rate is present", report.includes("conversion rate:"), `${calibration.conversionRate}%`),
    check("average shot quality is present", report.includes("average shot quality:"), `${calibration.averageShotQuality}`),
    check("Team Shot Profile includes CONTROL", report.includes("### CONTROL"), "CONTROL profile present"),
    check("Team Shot Profile includes BLITZ", report.includes("### BLITZ"), "BLITZ profile present"),
    check("Scoreline Plausibility section exists", report.includes("## Scoreline Plausibility"), "plausibility section present"),
    check("Gameplay Calibration Flags section exists", report.includes("## Gameplay Calibration Flags"), "flags section present"),
    check("Recommendation section exists", report.includes("## Recommendation"), "recommendation section present"),
    check("recommendation is one of allowed values", ALLOWED_RECOMMENDATIONS.includes(calibration.recommendation), calibration.recommendation),
    check("no point-value change is made during calibration sprint", V1_SCORING_RULES.rules.find((rule) => rule.actionType === "SHOT_GOAL")?.pointValue === 3, "SHOT_GOAL remains 3"),
    check("V2_DROP_FOUNDATION rules remain outside shot-difficulty calibration", activeV2RuleLeakageCount === 0, `${activeV2RuleLeakageCount}`),
    check("existing scoring rules V1 validation still passes", scoringRules.includes("Status: PASS"), "scoring rules V1 PASS"),
    check("existing score unit validation still passes", scoreUnit.includes("Status: PASS"), "score unit PASS"),
    check("existing shot outcome validation still passes", shotOutcome.includes("Status: PASS"), "shot outcome PASS"),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
  ];
  const validationPath = join(input.reportDirectory, "validation.scoring-v1-gameplay-calibration.md");

  writeFileSync(
    validationPath,
    renderMarkdown({
      checks,
      totalShots: calibration.totalShots,
      shotGoals: calibration.shotGoals,
      conversionRate: calibration.conversionRate,
      lowQualityGoals: calibration.lowQualityGoals,
      highQualityMisses: calibration.highQualityMisses,
      forcedShotCount: calibration.forcedLowQualityShots,
      recommendation: calibration.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath: validationPath,
    checks,
  };
}
