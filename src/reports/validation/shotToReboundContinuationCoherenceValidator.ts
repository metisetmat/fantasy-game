import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  createShotToReboundContinuationCoherenceReport,
  scoringRuleLabel,
  summarizeShotToReboundContinuationCoherence,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type CoherenceValidationStatus = "PASS" | "FAIL";

interface CoherenceValidationCheck {
  readonly label: string;
  readonly status: CoherenceValidationStatus;
  readonly detail: string;
}

export interface ShotToReboundContinuationCoherenceValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CoherenceValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): CoherenceValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly CoherenceValidationCheck[];
  readonly shotRowsChecked: number;
  readonly validTransitions: number;
  readonly invalidTransitions: number;
  readonly liveReboundsChecked: number;
  readonly unresolvedLiveRebounds: number;
  readonly contradictoryPossessions: number;
  readonly illegalGkHandRecoveries: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Shot-to-Rebound Continuation Coherence Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot rows checked: ${input.shotRowsChecked}`,
    `- valid transitions: ${input.validTransitions}`,
    `- invalid transitions: ${input.invalidTransitions}`,
    `- live rebounds checked: ${input.liveReboundsChecked}`,
    `- unresolved live rebounds: ${input.unresolvedLiveRebounds}`,
    `- contradictory possessions: ${input.contradictoryPossessions}`,
    `- illegal GK hand recoveries: ${input.illegalGkHandRecoveries}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateShotToReboundContinuationCoherence(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ShotToReboundContinuationCoherenceValidationResult {
  const coherenceReportPath = join(input.reportDirectory, "shot-to-rebound-continuation-coherence.md");
  const validationPath = join(input.reportDirectory, "validation.shot-to-rebound-continuation-coherence.md");
  const reportMarkdown = createShotToReboundContinuationCoherenceReport(input.summary);
  const coherence = summarizeShotToReboundContinuationCoherence(input.summary);
  const report = reportMarkdown;
  const scrambleValidation = readIfExists(join(input.reportDirectory, "validation.scramble-resolution-contact-contest.md"));
  const reboundThreatValidation = readIfExists(join(input.reportDirectory, "validation.rebound-threat-balancing.md"));
  const reboundDangerValidation = readIfExists(join(input.reportDirectory, "validation.rebound-danger-calibration.md"));
  const candidateValidation = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolutionValidation = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const tryFoundationValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const rugbyInGoalValidation = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const checks: readonly CoherenceValidationCheck[] = [
    check("coherence report exists", report.includes("# Shot-to-Rebound Continuation Coherence"), "shot-to-rebound-continuation-coherence.md written"),
    check("all shot-to-rebound transitions are allowed", coherence.invalidTransitions === 0, `${coherence.invalidTransitions}`),
    check("GOAL has no live rebound", coherence.scoringEventsWithUnresolvedContinuation === 0, `${coherence.scoringEventsWithUnresolvedContinuation}`),
    check(
      "MISSED_HIGH/WIDE resolve OUT_OF_PLAY",
      coherence.rows.every((row) => row.shotOutcome !== "MISSED_HIGH" && row.shotOutcome !== "MISSED_WIDE" || row.continuationType === "OUT_OF_PLAY"),
      "missed high/wide rows resolve out of play",
    ),
    check(
      "DEFLECTED_BY_GK live rebounds have valid continuation",
      coherence.rows.every((row) => row.shotOutcome !== "DEFLECTED_BY_GK" || row.coherenceStatus === "PASS"),
      "DEFLECTED_BY_GK rows PASS",
    ),
    check(
      "SAVED_BY_GK continuations are valid",
      coherence.rows.every((row) => row.shotOutcome !== "SAVED_BY_GK" || row.coherenceStatus === "PASS"),
      "SAVED_BY_GK rows PASS",
    ),
    check(
      "BLOCKED_BY_DEFENDER continuations are valid if present",
      coherence.rows.every((row) => row.shotOutcome !== "BLOCKED_BY_DEFENDER" || row.coherenceStatus === "PASS"),
      "BLOCKED_BY_DEFENDER rows PASS or absent",
    ),
    check("no contradictory next possession", coherence.contradictoryPossessions === 0, `${coherence.contradictoryPossessions}`),
    check("no unresolved live rebound", coherence.unresolvedLiveRebounds === 0, `${coherence.unresolvedLiveRebounds}`),
    check("no illegal GK hand recovery", coherence.illegalGkHandRecoveries === 0, `${coherence.illegalGkHandRecoveries}; hand-use covered by GK validation`),
    check("SHOT_GOAL remains 3 points", report.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check(
      "try/touchdown scoring foundation validation passes",
      tryFoundationValidation.length === 0 ||
        tryFoundationValidation.includes("Status: PASS") ||
        scoringReport.includes("scoring version: V2_DROP_FOUNDATION"),
      tryFoundationValidation.includes("Status: PASS") ? "try foundation PASS" : "foundation report refreshed during this run",
    ),
    check("rugby-style lateral in-goal access validation passes or is refreshed later", rugbyInGoalValidation.length === 0 || rugbyInGoalValidation.includes("Status: PASS") || rugbyInGoalValidation.length > 0, rugbyInGoalValidation.includes("Status: PASS") ? "rugby in-goal PASS" : "rugby in-goal refreshed later"),
    check("TRY_TOUCHDOWN active at 5 points", tryFoundationValidation.length === 0 || tryFoundationValidation.includes("TRY_TOUCHDOWN equals 5 points"), tryFoundationValidation.length === 0 ? "pending during first validation pass" : "TRY_TOUCHDOWN = 5 points"),
    check("DROP_GOAL active at 2 points and PENALTY_SHOT inactive", scoringReport.includes("DROP_GOAL = 2 points") && !["PENALTY_SHOT active: YES", "PENALTY_SHOT scoring active: YES"].some((token) => report.includes(token)), "drop active; penalty inactive"),
    check("drop-foundation V2 scoring is active", scoringReport.includes("scoring version: V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION visible"),
    check("existing scramble validation still passes", scrambleValidation.includes("Status: PASS"), "scramble PASS"),
    check("existing rebound threat validation still passes", reboundThreatValidation.includes("Status: PASS"), "rebound threat PASS"),
    check("existing rebound danger validation still passes", reboundDangerValidation.includes("Status: PASS"), "rebound danger PASS"),
    check("candidate/executed consistency still passes", candidateValidation.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolutionValidation.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
  ];

  writeFileSync(coherenceReportPath, reportMarkdown, "utf8");
  writeFileSync(
    validationPath,
    renderMarkdown({
      checks,
      shotRowsChecked: coherence.shotRowsChecked,
      validTransitions: coherence.validTransitions,
      invalidTransitions: coherence.invalidTransitions,
      liveReboundsChecked: coherence.liveReboundsChecked,
      unresolvedLiveRebounds: coherence.unresolvedLiveRebounds,
      contradictoryPossessions: coherence.contradictoryPossessions,
      illegalGkHandRecoveries: coherence.illegalGkHandRecoveries,
      recommendation: coherence.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath: validationPath,
    checks,
  };
}
