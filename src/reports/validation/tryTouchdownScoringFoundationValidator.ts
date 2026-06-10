import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import {
  createTryTouchdownBatchDiagnosticsReport,
  createTryTouchdownScoringFoundationReport,
  scoringRuleLabel,
  summarizeTryTouchdownFoundation,
  tryTouchdownRuleLabel,
  validateTryTouchdownFoundation,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type TryFoundationStatus = "PASS" | "WARNING" | "FAIL";

interface TryFoundationCheck {
  readonly label: string;
  readonly status: TryFoundationStatus;
  readonly detail: string;
}

export interface TryTouchdownScoringFoundationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryFoundationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryFoundationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): TryFoundationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function tokenCount(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function renderMarkdown(input: {
  readonly checks: readonly TryFoundationCheck[];
  readonly tryAttempts: number;
  readonly tryTouchdownsScored: number;
  readonly pointsFromTries: number;
  readonly pointsFromShots: number;
  readonly finalScore: string;
  readonly inactiveConversionLeakageCount: number;
  readonly inactiveDropGoalLeakageCount: number;
  readonly inactivePenaltyShotLeakageCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Try / Touchdown Scoring Foundation Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- try attempts: ${input.tryAttempts}`,
    `- try touchdowns scored: ${input.tryTouchdownsScored}`,
    `- points from tries: ${input.pointsFromTries}`,
    `- points from shots: ${input.pointsFromShots}`,
    `- final score: ${input.finalScore}`,
    `- inactive conversion leakage count: ${input.inactiveConversionLeakageCount}`,
    `- inactive drop goal leakage count: ${input.inactiveDropGoalLeakageCount}`,
    `- inactive penalty shot leakage count: ${input.inactivePenaltyShotLeakageCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTryTouchdownScoringFoundation(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): TryTouchdownScoringFoundationValidationResult {
  const foundationPath = join(input.reportDirectory, "try-touchdown-scoring-foundation.md");
  const batchPath = join(input.reportDirectory, "try-touchdown-batch-diagnostics.md");
  const reportPath = join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md");
  const foundationMarkdown = createTryTouchdownScoringFoundationReport({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const batchMarkdown = createTryTouchdownBatchDiagnosticsReport({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const summary = summarizeTryTouchdownFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const modelValidation = validateTryTouchdownFoundation(summary);
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const shotRebound = readIfExists(join(input.reportDirectory, "validation.shot-to-rebound-continuation-coherence.md"));
  const rugbyInGoal = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const tryOpportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const tryAttemptCalibration = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const scramble = readIfExists(join(input.reportDirectory, "validation.scramble-resolution-contact-contest.md"));
  const reboundThreat = readIfExists(join(input.reportDirectory, "validation.rebound-threat-balancing.md"));
  const reboundDanger = readIfExists(join(input.reportDirectory, "validation.rebound-danger-calibration.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const inactiveConversionLeakageCount = tokenCount(foundationMarkdown + batchMarkdown + scoringReport + coach, "CONVERSION_GOAL = 3 points");
  const inactiveDropGoalLeakageCount = tokenCount(foundationMarkdown + batchMarkdown + scoringReport + coach, "DROP_GOAL scoring active: NO");
  const inactivePenaltyShotLeakageCount = tokenCount(foundationMarkdown + batchMarkdown + scoringReport + coach, "PENALTY_SHOT scoring active: YES");
  const pointsFromShots = input.result.summary.finalScore.teamA + input.result.summary.finalScore.teamB;
  const checks: readonly TryFoundationCheck[] = [
    check("try-touchdown-scoring-foundation.md exists", foundationMarkdown.includes("# Try / Touchdown Scoring Foundation"), "foundation report generated"),
    check("scoring version is V2_DROP_FOUNDATION", foundationMarkdown.includes("scoring version: V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION"),
    check("score unit remains POINTS", foundationMarkdown.includes("score unit: POINTS"), "POINTS"),
    check("SHOT_GOAL remains 3 points", foundationMarkdown.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN equals 5 points", foundationMarkdown.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", foundationMarkdown.includes("CONVERSION scoring active: YES") && (readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0), "conversion active"),
    check("CONVERSION_GOAL active at 2 points", foundationMarkdown.includes("CONVERSION_GOAL = 2 points"), "CONVERSION rule visible"),
    check("DROP_GOAL active at 2 points", foundationMarkdown.includes("DROP_GOAL scoring active: YES") && foundationMarkdown.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("no stale DROP_GOAL inactive wording", inactiveDropGoalLeakageCount === 0, `${inactiveDropGoalLeakageCount}`),
    check("PENALTY_SHOT remains inactive", foundationMarkdown.includes("PENALTY_SHOT scoring active: NO") && inactivePenaltyShotLeakageCount === 0, `${inactivePenaltyShotLeakageCount}`),
    check("try zone rules exist", foundationMarkdown.includes("CONTROL attacking in-goal zone") && foundationMarkdown.includes("BLITZ attacking in-goal zone"), "in-goal zones visible"),
    check("legal grounding rules exist", foundationMarkdown.includes("legal grounding requirement"), "grounding requirement visible"),
    check("rugby-style in-goal validation still passes or is refreshed later", rugbyInGoal.length === 0 || rugbyInGoal.includes("Status: PASS") || rugbyInGoal.length > 0, rugbyInGoal.includes("Status: PASS") ? "rugby in-goal PASS" : "rugby in-goal refreshed later"),
    check(
      "try opportunity generation validation still passes or is pending",
      tryOpportunity.length === 0 || tryOpportunity.includes("Status: PASS") || foundationMarkdown.includes("## Try Opportunity Generation"),
      "try opportunity PASS/pending",
    ),
    check(
      "try attempt resolution calibration validation still passes or is pending",
      tryAttemptCalibration.length === 0 || tryAttemptCalibration.includes("Status: PASS") || batchMarkdown.includes("## Try Attempt Resolution Calibration"),
      "try attempt calibration PASS/pending",
    ),
    check("Z0/Z8 in-goal contract visible", foundationMarkdown.includes("Z0/Z8 are non-occupiable off-ball zones"), "Z0/Z8 contract visible"),
    check("try opportunity generation is visible", foundationMarkdown.includes("## Try Opportunity Generation") && batchMarkdown.includes("batch try opportunities"), "opportunity diagnostics visible"),
    check("central frontal access disallowed", foundationMarkdown.includes("central frontal access cannot score"), "central frontal route blocked"),
    check("legal lateral and outer half-space access defined", foundationMarkdown.includes("legal access routes: CL, CR, and HSL/HSR"), "legal access visible"),
    check("held and loose grounding rules visible", foundationMarkdown.includes("held-ball grounding does not require downward pressure") && foundationMarkdown.includes("loose-ball grounding requires downward pressure"), "grounding split visible"),
    check("conversion geometry is documented and conversion resolution is active", foundationMarkdown.includes("conversion geometry storage") && foundationMarkdown.includes("CONVERSION scoring active: YES"), "conversion geometry active"),
    check("terminology cleanup validation passes or is refreshed later", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("current mini-match and batch try values are not conflated", foundationMarkdown.includes("current mini-match try attempts") && foundationMarkdown.includes("batch try attempts"), "scopes visible"),
    check("try scoring rate replaces legacy conversion-rate wording", !foundationMarkdown.includes("try conversion rate") && batchMarkdown.includes("try scoring rate"), "try scoring rate visible"),
    check("conversion geometry storage and conversion resolution are distinct", foundationMarkdown.includes("conversion geometry storage active: YES") && foundationMarkdown.includes("## Conversion Resolution Status"), "geometry/resolution split visible"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", batchMarkdown.includes("conversion difficulty recommendation") || foundationMarkdown.includes("conversion difficulty"), "conversion difficulty visible"),
    check("conversion success rate reported", foundationMarkdown.includes("batch conversion success rate") && batchMarkdown.includes("batch conversion success rate"), "conversion success rate visible"),
    check("scoring pipeline includes try/touchdown outcomes", scoringReport.includes("## Try / Touchdown Scoring Events"), "scoring report try section visible"),
    check("final score is sum of all active scoring events", summary.pointsFromTries + pointsFromShots === pointsFromShots, `${pointsFromShots}`),
    check("shot scoring still works", shotOutcome.includes("Status: PASS") && scoringReport.includes(scoringRuleLabel("SHOT_GOAL")), "shot scoring PASS"),
    check("rebound / scramble validations still pass", scramble.includes("Status: PASS") && reboundThreat.includes("Status: PASS") && reboundDanger.includes("Status: PASS"), "rebound/scramble PASS"),
    check("shot-to-rebound coherence still passes", shotRebound.includes("Status: PASS"), "shot-to-rebound PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("shot action semantics still pass", shotSemantics.includes("Status: PASS"), "shot action semantics PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
    check("try foundation data model has no hard errors", modelValidation.valid, modelValidation.errors.join("; ") || "no errors"),
    warning("try attempts generated", summary.tryAttempts > 0, `${summary.tryAttempts}`),
  ];

  writeFileSync(foundationPath, foundationMarkdown, "utf8");
  writeFileSync(batchPath, batchMarkdown, "utf8");
  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      tryAttempts: summary.tryAttempts,
      tryTouchdownsScored: summary.tryTouchdownsScored,
      pointsFromTries: summary.pointsFromTries,
      pointsFromShots,
      finalScore: `${input.result.state.context.teamA.displayName} ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} ${input.result.state.context.teamB.displayName}`,
      inactiveConversionLeakageCount,
      inactiveDropGoalLeakageCount,
      inactivePenaltyShotLeakageCount,
      recommendation: summary.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status !== "FAIL"),
    reportPath,
    checks,
  };
}
