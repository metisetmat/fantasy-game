import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  scoringRuleLabel,
  SCORING_VERSION,
  summarizeReboundDangerCalibration,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ScrambleValidationStatus = "PASS" | "WARNING" | "FAIL";

interface ScrambleValidationCheck {
  readonly label: string;
  readonly status: ScrambleValidationStatus;
  readonly detail: string;
}

export interface ScrambleResolutionContactContestValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScrambleValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ScrambleValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warningCheck(label: string, passed: boolean, detail: string): ScrambleValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function isScrambleEvent(event: BatchScoringCalibrationSummary["samples"][number]["reboundEvents"][number]): boolean {
  return (
    event.continuationType === "SCRAMBLE" ||
    event.reason.includes("LOOSE_BALL") ||
    event.reason.includes("CONTACT_CONTEST") ||
    event.reason.includes("DOUBLE_TOUCH") ||
    event.reason.includes("CHAOTIC_CLEARANCE") ||
    event.reason.includes("DESPERATE_SECOND_SHOT")
  );
}

function renderMarkdown(input: {
  readonly checks: readonly ScrambleValidationCheck[];
  readonly matchesSimulated: number;
  readonly reboundEvents: number;
  readonly scrambles: number;
  readonly scrambleRate: number;
  readonly scrambleWinners: string;
  readonly secondShotWindowsFromScramble: number;
  readonly chaoticClearances: number;
  readonly unresolvedContestedRebounds: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Scramble Resolution & Contact Contest Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- rebound events: ${input.reboundEvents}`,
    `- scrambles: ${input.scrambles}`,
    `- scramble rate: ${input.scrambleRate}%`,
    `- scramble winners: ${input.scrambleWinners}`,
    `- second-shot windows from scramble: ${input.secondShotWindowsFromScramble}`,
    `- chaotic clearances: ${input.chaoticClearances}`,
    `- unresolved contested rebounds: ${input.unresolvedContestedRebounds}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScrambleResolutionContactContest(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ScrambleResolutionContactContestValidationResult {
  const report = readIfExists(join(input.reportDirectory, "rebound-danger-calibration.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const reboundThreatValidation = readIfExists(join(input.reportDirectory, "validation.rebound-threat-balancing.md"));
  const reboundDangerValidation = readIfExists(join(input.reportDirectory, "validation.rebound-danger-calibration.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const candidateValidation = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolutionValidation = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const calibration = summarizeReboundDangerCalibration(input.summary);
  const attackerScrambleWins = calibration.events.filter((event) => isScrambleEvent(event) && event.reboundWinner === "ATTACKER").length;
  const defenderScrambleWins = calibration.events.filter((event) => isScrambleEvent(event) && event.reboundWinner === "DEFENDER").length;
  const contestedScrambleWins = calibration.events.filter((event) => isScrambleEvent(event) && event.reboundWinner === "CONTESTED_REMAINS").length;
  const gkScrambleWins = calibration.events.filter((event) => isScrambleEvent(event) && event.reboundWinner === "GOALKEEPER").length;
  const checks: readonly ScrambleValidationCheck[] = [
    check("scramble resolution report exists or rebound danger report includes scramble calibration", report.includes("## Scramble Calibration"), "scramble calibration visible"),
    check("SHOT_GOAL remains 3 points", report.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("score unit remains POINTS", report.includes("score unit: POINTS"), "POINTS"),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !report.includes("| TRY |"), SCORING_VERSION),
    check("batch match count >= 20", calibration.matchesSimulated >= 20, `${calibration.matchesSimulated}`),
    warningCheck("scramble rate above previous 0%", calibration.scrambleRate > 0, `${calibration.scrambleRate}%`),
    check("scramble rate <= 20%", calibration.scrambleRate <= 20, `${calibration.scrambleRate}%`),
    check("second-shot windows are not automatic", calibration.secondShotWindowRate <= 30, `${calibration.secondShotWindowRate}%`),
    check("defensive clearances remain possible", calibration.defenderRecoveries > 0, `${calibration.defenderRecoveries}`),
    check("attacker recoveries remain possible", calibration.attackerRecoveries > 0, `${calibration.attackerRecoveries}`),
    check("GK recoveries remain possible", calibration.gkRecoveries > 0, `${calibration.gkRecoveries}`),
    check("unresolved contested rebounds = 0", calibration.unresolvedContestedRebounds === 0, `${calibration.unresolvedContestedRebounds}`),
    check("tactical evidence includes scramble line", tacticalEvidence.includes("scramble rate:") && tacticalEvidence.includes("scramble recommendation"), "tactical evidence scramble line visible"),
    check("scoring report includes scramble snapshot", scoringReport.includes("scramble events:") && scoringReport.includes("scramble-created second-shot windows"), "scoring scramble snapshot visible"),
    check("coach summary includes scramble line", coachSummary.includes("scramble model:"), "coach summary scramble line visible"),
    check("existing rebound threat validation still passes", reboundThreatValidation.includes("Status: PASS"), "rebound threat PASS"),
    check("existing rebound danger validation still passes", reboundDangerValidation.includes("Status: PASS"), "rebound danger PASS"),
    check("existing rebound continuation validation still passes", reboundContinuationValidation.includes("Status: PASS"), "rebound continuation PASS"),
    check("candidate/executed consistency still passes", candidateValidation.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolutionValidation.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
  ];
  const reportPath = join(input.reportDirectory, "validation.scramble-resolution-contact-contest.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: calibration.matchesSimulated,
      reboundEvents: calibration.reboundEvents,
      scrambles: calibration.scrambles,
      scrambleRate: calibration.scrambleRate,
      scrambleWinners: `ATTACKER ${attackerScrambleWins}, DEFENDER ${defenderScrambleWins}, GOALKEEPER ${gkScrambleWins}, CONTESTED_REMAINS ${contestedScrambleWins}`,
      secondShotWindowsFromScramble: calibration.scrambleCreatedSecondShotWindows,
      chaoticClearances: calibration.chaoticClearances,
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
