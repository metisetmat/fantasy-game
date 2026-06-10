import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  scoringRuleLabel,
  SCORING_VERSION,
  summarizeReboundDangerCalibration,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ReboundThreatStatus = "PASS" | "WARNING" | "FAIL";

interface ReboundThreatCheck {
  readonly label: string;
  readonly status: ReboundThreatStatus;
  readonly detail: string;
}

export interface ReboundThreatBalancingValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ReboundThreatCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ReboundThreatCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warningCheck(label: string, passed: boolean, detail: string): ReboundThreatCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ReboundThreatCheck[];
  readonly matchesSimulated: number;
  readonly reboundEvents: number;
  readonly contestedRebounds: number;
  readonly defenderClearanceRate: number;
  readonly attackerRecoveryRate: number;
  readonly secondShotWindowRate: number;
  readonly scrambleRate: number;
  readonly gkRecoveryRate: number;
  readonly mediumHighDangerRate: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Rebound Threat Balancing Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- rebound events: ${input.reboundEvents}`,
    `- contested rebounds: ${input.contestedRebounds}`,
    `- defender clearance rate: ${input.defenderClearanceRate}%`,
    `- attacker recovery rate: ${input.attackerRecoveryRate}%`,
    `- second-shot window rate: ${input.secondShotWindowRate}%`,
    `- scramble rate: ${input.scrambleRate}%`,
    `- GK recovery rate: ${input.gkRecoveryRate}%`,
    `- MEDIUM/HIGH danger rate: ${input.mediumHighDangerRate}%`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateReboundThreatBalancing(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ReboundThreatBalancingValidationResult {
  const report = readIfExists(join(input.reportDirectory, "rebound-danger-calibration.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const reboundDangerValidation = readIfExists(join(input.reportDirectory, "validation.rebound-danger-calibration.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const gkOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md"));
  const candidateValidation = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolutionValidation = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const calibration = summarizeReboundDangerCalibration(input.summary);
  const checks: readonly ReboundThreatCheck[] = [
    check("rebound threat balancing report exists", report.includes("# Rebound Danger Calibration"), "rebound danger report written"),
    check("SHOT_GOAL remains 3 points", report.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("score unit remains POINTS", report.includes("score unit: POINTS"), "POINTS"),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !report.includes("| TRY |"), SCORING_VERSION),
    check("batch match count >= 20", calibration.matchesSimulated >= 20, `${calibration.matchesSimulated}`),
    check("unresolved contested rebounds = 0", calibration.unresolvedContestedRebounds === 0, `${calibration.unresolvedContestedRebounds}`),
    warningCheck("defender clearance rate below previous 90%", calibration.defenderRecoveryRate < 90, `${calibration.defenderRecoveryRate}%`),
    warningCheck("attacker recovery rate above previous 0%", calibration.attackerRecoveryRate > 0, `${calibration.attackerRecoveryRate}%`),
    warningCheck("second-shot window rate above previous 0%", calibration.secondShotWindowRate > 0, `${calibration.secondShotWindowRate}%`),
    warningCheck("scramble rate above previous 0%", calibration.scrambleRate > 0, `${calibration.scrambleRate}%`),
    check("second-shot windows are not automatic", calibration.secondShotWindowRate <= 30, `${calibration.secondShotWindowRate}%`),
    check("defensive clearances remain possible", calibration.defenderRecoveries > 0, `${calibration.defenderRecoveries}`),
    warningCheck("GK recoveries remain possible or explicit warning if absent", calibration.gkRecoveries > 0, `${calibration.gkRecoveries}`),
    check("tactical evidence includes rebound threat balancing line", tacticalEvidence.includes("rebound threat balancing applied: YES"), "tactical evidence line visible"),
    check("scoring report includes updated rebound danger snapshot", scoringReport.includes("## Rebound Danger Snapshot"), "scoring snapshot visible"),
    check("coach summary includes rebound threat line", coachSummary.includes("rebound threat:"), "coach summary line visible"),
    check("existing rebound danger validation still passes", reboundDangerValidation.includes("Status: PASS"), "rebound danger PASS"),
    check("existing rebound continuation validation still passes", reboundContinuationValidation.includes("Status: PASS"), "rebound continuation PASS"),
    check("existing GK outcome diversity validation still passes", gkOutcomeValidation.includes("Status: PASS"), "GK outcome diversity PASS"),
    check("candidate/executed consistency still passes", candidateValidation.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolutionValidation.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
  ];
  const reportPath = join(input.reportDirectory, "validation.rebound-threat-balancing.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: calibration.matchesSimulated,
      reboundEvents: calibration.reboundEvents,
      contestedRebounds: calibration.contestedRebounds,
      defenderClearanceRate: calibration.defenderRecoveryRate,
      attackerRecoveryRate: calibration.attackerRecoveryRate,
      secondShotWindowRate: calibration.secondShotWindowRate,
      scrambleRate: calibration.scrambleRate,
      gkRecoveryRate: calibration.gkRecoveryRate,
      mediumHighDangerRate: calibration.mediumHighDangerRate,
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
