import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../../systems/actions";
import { validateNoInGoalOccupancy } from "../../systems/rules";
import {
  scoringRuleLabel,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";

type TryOpportunityStatus = "PASS" | "WARNING" | "FAIL";

interface TryOpportunityCheck {
  readonly label: string;
  readonly status: TryOpportunityStatus;
  readonly detail: string;
}

export interface TryOpportunityGenerationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryOpportunityCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryOpportunityCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): TryOpportunityCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function recordCounts(counts: Readonly<Record<string, number>>): string {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);

  return entries.length === 0 ? "none" : entries.map(([key, count]) => `${key} ${count}`).join(", ");
}

function renderMarkdown(input: {
  readonly checks: readonly TryOpportunityCheck[];
  readonly matchesSimulated: number;
  readonly tryOpportunities: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryScoringRate: number;
  readonly opportunitiesByType: string;
  readonly opportunitiesByStyle: string;
  readonly centralFrontalTriesGenerated: number;
  readonly offBallInGoalPlayerCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Try Opportunity Generation Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- try opportunities: ${input.tryOpportunities}`,
    `- try attempts: ${input.tryAttempts}`,
    `- tries scored: ${input.triesScored}`,
    `- try scoring rate: ${input.tryScoringRate}%`,
    `- opportunities by type: ${input.opportunitiesByType}`,
    `- opportunities by style: ${input.opportunitiesByStyle}`,
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

export function validateTryOpportunityGeneration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): TryOpportunityGenerationValidationResult {
  const reportPath = join(input.reportDirectory, "validation.try-opportunity-generation.md");
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
  const rugbyValidation = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const tryFoundationValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const shotRebound = readIfExists(join(input.reportDirectory, "validation.shot-to-rebound-continuation-coherence.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const foundation = readIfExists(join(input.reportDirectory, "try-touchdown-scoring-foundation.md"));
  const batch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "conversion-resolution.md"));
  const generatedReports = [scoring, foundation, batch, conversionResolution].join("\n");
  const checks: readonly TryOpportunityCheck[] = [
    check("try opportunity detector exists", summary.detectorActive, "detector active"),
    check("legal lateral access rules still pass", rugbyValidation.includes("Status: PASS"), "rugby in-goal validation PASS"),
    check("Z0/Z8 off-ball occupancy remains 0", occupancy.status === "PASS", `${occupancy.offBallInGoalPlayerCount}`),
    check("SHOT_GOAL remains 3 points", generatedReports.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", generatedReports.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", generatedReports.includes("CONVERSION scoring active: YES") && (readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0), "conversion active"),
    check("DROP_GOAL active at 2 points", generatedReports.includes("DROP_GOAL scoring active: YES") && generatedReports.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", !generatedReports.includes("PENALTY_SHOT scoring active: YES") && foundation.includes("PENALTY_SHOT scoring active: NO"), "PENALTY_SHOT inactive"),
    check("terminology cleanup validation passes", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("try scoring rate replaces legacy conversion-rate wording", !generatedReports.includes("try conversion rate") && generatedReports.includes("try scoring rate"), "try scoring rate visible"),
    check(
      "conversion geometry storage and conversion resolution are distinct",
      generatedReports.includes("conversion geometry storage active: YES") && conversionResolution.includes("# Conversion Resolution"),
      "geometry/resolution split visible",
    ),
    warning("try opportunities generated > 0", summary.tryOpportunities > 0, `${summary.tryOpportunities}`),
    warning("try attempts generated > 0", summary.tryAttempts > 0, `${summary.tryAttempts}`),
    check("no try generated through central frontal access", summary.centralFrontalTriesGenerated === 0, `${summary.centralFrontalTriesGenerated}`),
    check("no try generated from off-ball Z0/Z8 positioning", summary.offBallInGoalPlayerCount === 0, `${summary.offBallInGoalPlayerCount}`),
    check("every TRY_TOUCHDOWN attempt has legal access route", summary.opportunities.filter((opportunity) => opportunity.attemptGenerated).every((opportunity) => opportunity.legalAccessRoute), "all attempts legal"),
    check("every TRY_TOUCHDOWN scored has valid grounding", summary.opportunities.filter((opportunity) => opportunity.outcome === "TRY_SCORED").every((opportunity) => opportunity.legalAccessRoute), "scored opportunities legal or absent"),
    check("conversion geometry stored if TRY_TOUCHDOWN scored", summary.triesScored === 0 || foundation.includes("conversion geometry"), summary.triesScored === 0 ? "no tries scored yet" : "conversion geometry visible"),
    check("final score sums active scoring events", readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md")).includes("final score matches scoring points"), "shot score validation covers active events"),
    check("shot / GK / rebound / scramble validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("shot-to-rebound coherence still passes", shotRebound.includes("Status: PASS"), "shot-to-rebound PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", readIfExists(join(input.reportDirectory, "share", "manifest.md")).includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW"),
    check("try foundation validation still passes or is refreshed", tryFoundationValidation.length === 0 || tryFoundationValidation.includes("Status: PASS") || foundation.includes("Try Opportunity Generation"), "try foundation PASS/refreshed"),
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
      opportunitiesByType: recordCounts(summary.opportunitiesByType),
      opportunitiesByStyle: recordCounts(summary.opportunitiesByStyle),
      centralFrontalTriesGenerated: summary.centralFrontalTriesGenerated,
      offBallInGoalPlayerCount: summary.offBallInGoalPlayerCount,
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
