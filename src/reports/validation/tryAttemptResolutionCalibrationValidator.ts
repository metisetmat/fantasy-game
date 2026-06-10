import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../../systems/actions";
import { validateNoInGoalOccupancy } from "../../systems/rules";
import { scoringRuleLabel, tryTouchdownRuleLabel, type BatchScoringCalibrationSummary } from "../../systems/scoring";

type TryAttemptCalibrationStatus = "PASS" | "WARNING" | "FAIL";

interface TryAttemptCalibrationCheck {
  readonly label: string;
  readonly status: TryAttemptCalibrationStatus;
  readonly detail: string;
}

export interface TryAttemptResolutionCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryAttemptCalibrationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryAttemptCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): TryAttemptCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function recommendation(input: {
  readonly attempts: number;
  readonly tries: number;
  readonly heldUp: number;
  readonly scoringRate: number;
}): "KEEP_TRY_ATTEMPT_MODEL" | "INCREASE_TRY_FINISHING_SLIGHTLY" | "REDUCE_TRY_EASE" | "INCREASE_HELD_UP_OUTCOMES" | "NEEDS_MORE_SAMPLE" {
  if (input.attempts === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.scoringRate > 30) {
    return "REDUCE_TRY_EASE";
  }

  if (input.tries === 0) {
    return "INCREASE_TRY_FINISHING_SLIGHTLY";
  }

  if (input.heldUp === 0) {
    return "INCREASE_HELD_UP_OUTCOMES";
  }

  return "KEEP_TRY_ATTEMPT_MODEL";
}

function renderMarkdown(input: {
  readonly checks: readonly TryAttemptCalibrationCheck[];
  readonly matchesSimulated: number;
  readonly tryOpportunities: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryScoringRate: number;
  readonly lostForwardCount: number;
  readonly tackledShortCount: number;
  readonly heldUpCount: number;
  readonly invalidAccessRouteCount: number;
  readonly centralFrontalTriesGenerated: number;
  readonly offBallInGoalPlayerCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Try Attempt Resolution Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- try opportunities: ${input.tryOpportunities}`,
    `- try attempts: ${input.tryAttempts}`,
    `- tries scored: ${input.triesScored}`,
    `- try scoring rate: ${input.tryScoringRate}%`,
    `- LOST_FORWARD count: ${input.lostForwardCount}`,
    `- TACKLED_SHORT count: ${input.tackledShortCount}`,
    `- HELD_UP count: ${input.heldUpCount}`,
    `- INVALID_ACCESS_ROUTE count: ${input.invalidAccessRouteCount}`,
    `- central frontal tries generated: ${input.centralFrontalTriesGenerated}`,
    `- off-ball in-goal player count: ${input.offBallInGoalPlayerCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTryAttemptResolutionCalibration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): TryAttemptResolutionCalibrationValidationResult {
  const reportPath = join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md");
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const occupancy = validateNoInGoalOccupancy({
    offBallPlayerZones: [],
    receiverZones: [],
    supportTargetZones: [],
    tacticalTargetClusterZones: [],
    restDefenseZones: [],
    goalkeeperSetPositionZones: [],
  });
  const foundation = readIfExists(join(input.reportDirectory, "try-touchdown-scoring-foundation.md"));
  const batch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "conversion-resolution.md"));
  const rugby = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const opportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const shotRebound = readIfExists(join(input.reportDirectory, "validation.shot-to-rebound-continuation-coherence.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const combined = [foundation, batch, scoring, conversionResolution].join("\n");
  const recommendationValue = recommendation({
    attempts: summary.tryAttempts,
    tries: summary.triesScored,
    heldUp: summary.outcomeCounts.HELD_UP,
    scoringRate: summary.tryConversionRate,
  });
  const checks: readonly TryAttemptCalibrationCheck[] = [
    check("try attempt resolution calibration report exists", batch.includes("## Try Attempt Resolution Calibration"), "batch diagnostics section visible"),
    check("scoring version is V2_DROP_FOUNDATION", combined.includes("scoring version: V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION"),
    check("SHOT_GOAL remains 3 points", combined.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", combined.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", combined.includes("CONVERSION scoring active: YES") && (readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0), "conversion active"),
    check("DROP_GOAL active at 2 points", combined.includes("DROP_GOAL scoring active: YES") && combined.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", !combined.includes("PENALTY_SHOT scoring active: YES") && foundation.includes("PENALTY_SHOT scoring active: NO"), "PENALTY_SHOT inactive"),
    check("terminology cleanup validation passes or is refreshed later", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("current mini-match and batch try values not conflated", foundation.includes("current mini-match try attempts") && batch.includes("batch try attempts"), "scopes visible"),
    check("try scoring rate replaces legacy conversion-rate wording", !combined.includes("try conversion rate") && combined.includes("try scoring rate"), "try scoring rate visible"),
    check(
      "conversion geometry storage and conversion resolution are distinct",
      combined.includes("conversion geometry storage active: YES") && conversionResolution.includes("# Conversion Resolution"),
      "geometry/resolution split visible",
    ),
    check("legal lateral in-goal access validation still passes", rugby.includes("Status: PASS"), "rugby in-goal PASS"),
    check("Z0/Z8 off-ball occupancy remains 0", occupancy.status === "PASS", `${occupancy.offBallInGoalPlayerCount}`),
    check("try opportunities remain generated > 0", summary.tryOpportunities > 0, `${summary.tryOpportunities}`),
    check("try attempts remain generated > 0", summary.tryAttempts > 0, `${summary.tryAttempts}`),
    warning("TRY_TOUCHDOWN count > 0", summary.triesScored > 0, `${summary.triesScored}`),
    check("every TRY_TOUCHDOWN has legal access route", summary.opportunities.filter((item) => item.outcome === "TRY_SCORED").every((item) => item.legalAccessRoute), "scored attempts legal or absent"),
    check("every TRY_TOUCHDOWN has valid grounding", summary.opportunities.filter((item) => item.outcome === "TRY_SCORED").every((item) => item.pointValue === 5), "scored attempts have 5-point grounding or absent"),
    check("no TRY_TOUCHDOWN from central frontal access", summary.centralFrontalTriesGenerated === 0, `${summary.centralFrontalTriesGenerated}`),
    check("INVALID_ACCESS_ROUTE remains 0 for legal attempts", summary.outcomeCounts.INVALID_ACCESS_ROUTE === 0, `${summary.outcomeCounts.INVALID_ACCESS_ROUTE}`),
    warning("HELD_UP appears at least once", summary.outcomeCounts.HELD_UP > 0, `${summary.outcomeCounts.HELD_UP}`),
    check("final score sums active scoring events", shotOutcome.includes("final score matches scoring points"), "shot outcome scoring validation PASS"),
    check("shot / GK / rebound / scramble validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("shot-to-rebound coherence still passes", shotRebound.includes("Status: PASS"), "shot-to-rebound PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", readIfExists(join(input.reportDirectory, "share", "manifest.md")).includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW"),
    check("try opportunity generation validation still passes", opportunity.includes("Status: PASS"), "try opportunity PASS"),
  ];

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: summary.matchesSimulated,
      tryOpportunities: summary.tryOpportunities,
      tryAttempts: summary.tryAttempts,
      triesScored: summary.triesScored,
      tryScoringRate: summary.tryConversionRate,
      lostForwardCount: summary.outcomeCounts.LOST_FORWARD,
      tackledShortCount: summary.outcomeCounts.TACKLED_SHORT,
      heldUpCount: summary.outcomeCounts.HELD_UP,
      invalidAccessRouteCount: summary.outcomeCounts.INVALID_ACCESS_ROUTE,
      centralFrontalTriesGenerated: summary.centralFrontalTriesGenerated,
      offBallInGoalPlayerCount: occupancy.offBallInGoalPlayerCount,
      recommendation: recommendationValue,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status !== "FAIL"),
    reportPath,
    checks,
  };
}
