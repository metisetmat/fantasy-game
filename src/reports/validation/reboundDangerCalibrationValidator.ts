import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  scoringRuleLabel,
  SCORING_VERSION,
  summarizeReboundDangerCalibration,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";

type ReboundDangerValidationStatus = "PASS" | "WARNING" | "FAIL";

interface ReboundDangerCalibrationCheck {
  readonly label: string;
  readonly status: ReboundDangerValidationStatus;
  readonly detail: string;
}

export interface ReboundDangerCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ReboundDangerCalibrationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ReboundDangerCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warningCheck(label: string, passed: boolean, detail: string): ReboundDangerCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ReboundDangerCalibrationCheck[];
  readonly matchesSimulated: number;
  readonly reboundEvents: number;
  readonly contestedRebounds: number;
  readonly resolvedRebounds: number;
  readonly attackerRecoveries: number;
  readonly defenderRecoveries: number;
  readonly gkRecoveries: number;
  readonly secondShotWindows: number;
  readonly scrambles: number;
  readonly unresolvedContestedRebounds: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Rebound Danger Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- rebound events: ${input.reboundEvents}`,
    `- contested rebounds: ${input.contestedRebounds}`,
    `- resolved rebounds: ${input.resolvedRebounds}`,
    `- attacker recoveries: ${input.attackerRecoveries}`,
    `- defender recoveries: ${input.defenderRecoveries}`,
    `- GK recoveries: ${input.gkRecoveries}`,
    `- second-shot windows: ${input.secondShotWindows}`,
    `- scrambles: ${input.scrambles}`,
    `- unresolved contested rebounds: ${input.unresolvedContestedRebounds}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateReboundDangerCalibration(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ReboundDangerCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "rebound-danger-calibration.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const gkOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md"));
  const gkGoalAreaValidation = readIfExists(join(input.reportDirectory, "validation.gk-shot-stopping-goal-area.md"));
  const candidateValidation = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolutionValidation = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const calibration = summarizeReboundDangerCalibration(input.summary);
  const allowedRecommendations = [
    "KEEP_REBOUND_MODEL_BUT_MONITOR",
    "INCREASE_ATTACKER_REBOUND_THREAT",
    "REDUCE_AUTOMATIC_DEFENSIVE_CLEARANCE",
    "INCREASE_SCRAMBLE_VARIANCE",
    "REDUCE_SECOND_SHOT_FREQUENCY",
    "NEEDS_MORE_SAMPLE",
  ];
  const checks: readonly ReboundDangerCalibrationCheck[] = [
    check("rebound-danger-calibration.md exists", report.includes("# Rebound Danger Calibration"), "rebound danger report written"),
    check("scoring rule remains SHOT_GOAL = 3 points", report.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("score unit remains POINTS", report.includes("score unit: POINTS"), "POINTS"),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !report.includes("| TRY |"), SCORING_VERSION),
    check("batch match count >= 20", calibration.matchesSimulated >= 20, `${calibration.matchesSimulated}`),
    check("rebound events are counted", report.includes("rebound events:") && calibration.reboundEvents >= 0, `${calibration.reboundEvents}`),
    check("contested rebounds are counted", report.includes("contested rebounds:") && calibration.contestedRebounds >= 0, `${calibration.contestedRebounds}`),
    check("unresolved contested rebounds = 0", calibration.unresolvedContestedRebounds === 0, `${calibration.unresolvedContestedRebounds}`),
    check("rebound outcome distribution exists", report.includes("## Rebound Outcome Distribution"), "distribution visible"),
    check("rebound danger distribution exists", report.includes("## Rebound Danger Distribution"), "danger distribution visible"),
    check("team rebound profile exists", report.includes("## Team Rebound Profile"), "team profile visible"),
    check("style rebound profile exists", report.includes("## Style Rebound Profile"), "style profile visible"),
    check("rebound sample table exists", report.includes("## Rebound Sample Table"), "sample table visible"),
    check("recommendation is allowed", allowedRecommendations.includes(calibration.recommendation), calibration.recommendation),
    warningCheck("attacker recovery rate is above 0", calibration.attackerRecoveryRate > 0, `${calibration.attackerRecoveryRate}%`),
    warningCheck("second-shot window rate is above 0", calibration.secondShotWindowRate > 0, `${calibration.secondShotWindowRate}%`),
    warningCheck("defender clearance rate is not excessive", calibration.defenderRecoveryRate <= 85, `${calibration.defenderRecoveryRate}%`),
    check("second-shot windows are not automatic", calibration.secondShotWindowRate <= 30, `${calibration.secondShotWindowRate}%`),
    check("scoring report includes rebound danger snapshot", scoringReport.includes("## Rebound Danger Snapshot"), "scoring snapshot visible"),
    check("tactical evidence includes compact rebound danger calibration line", tacticalEvidence.includes("rebound danger calibration recommendation"), "tactical evidence line visible"),
    check("coach summary includes rebound danger line", coachSummary.includes("rebound danger:"), "coach summary line visible"),
    check("existing rebound continuation validation still passes", reboundContinuationValidation.includes("Status: PASS"), "rebound continuation PASS"),
    check("existing GK outcome diversity validation still passes", gkOutcomeValidation.includes("Status: PASS"), "GK outcome diversity PASS"),
    check("existing GK shot-stopping validation still passes", gkGoalAreaValidation.includes("Status: PASS"), "GK goal-area PASS"),
    check("candidate/executed consistency still passes", candidateValidation.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolutionValidation.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coachSummary.split("\n").length < 120, `${coachSummary.split("\n").length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.rebound-danger-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: calibration.matchesSimulated,
      reboundEvents: calibration.reboundEvents,
      contestedRebounds: calibration.contestedRebounds,
      resolvedRebounds: calibration.resolvedRebounds,
      attackerRecoveries: calibration.attackerRecoveries,
      defenderRecoveries: calibration.defenderRecoveries,
      gkRecoveries: calibration.gkRecoveries,
      secondShotWindows: calibration.secondShotWindows,
      scrambles: calibration.scrambles,
      unresolvedContestedRebounds: calibration.unresolvedContestedRebounds,
      recommendation: calibration.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status !== "FAIL"),
    reportPath,
    checks,
  };
}
