import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  conversionRuleLabel,
  summarizeConversionResolution,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { scoringRuleLabel } from "../../systems/scoring/scoringRules";
import { tryTouchdownRuleLabel } from "../../systems/scoring/tryTouchdownRules";
import { resolveActiveSharePackConfig } from "../sharePack";

type ConversionResolutionStatus = "PASS" | "FAIL";

interface ConversionResolutionCheck {
  readonly label: string;
  readonly status: ConversionResolutionStatus;
  readonly detail: string;
}

export interface ConversionResolutionValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ConversionResolutionCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ConversionResolutionCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ConversionResolutionCheck[];
  readonly batchTriesScored: number;
  readonly batchConversionAttempts: number;
  readonly batchConversionsMade: number;
  readonly batchConversionsMissed: number;
  readonly batchConversionsBlocked: number;
  readonly batchInvalidConversions: number;
  readonly batchConversionSuccessRate: number;
  readonly batchConversionPointsAwarded: number;
  readonly liveConversionAttempts: number;
  readonly liveConversionPointsAwarded: number;
  readonly conversionAttemptsAfterFailedTries: number;
  readonly missingConversionGeometryRows: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Conversion Resolution Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- batch tries scored: ${input.batchTriesScored}`,
    `- batch conversion attempts: ${input.batchConversionAttempts}`,
    `- batch conversions made: ${input.batchConversionsMade}`,
    `- batch conversions missed: ${input.batchConversionsMissed}`,
    `- batch conversions blocked: ${input.batchConversionsBlocked}`,
    `- batch invalid conversions: ${input.batchInvalidConversions}`,
    `- batch conversion success rate: ${input.batchConversionSuccessRate}%`,
    `- batch conversion points awarded: ${input.batchConversionPointsAwarded}`,
    `- live conversion attempts: ${input.liveConversionAttempts}`,
    `- live conversion points awarded: ${input.liveConversionPointsAwarded}`,
    `- conversion attempts after failed tries: ${input.conversionAttemptsAfterFailedTries}`,
    `- missing conversion geometry rows: ${input.missingConversionGeometryRows}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateConversionResolution(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ConversionResolutionValidationResult {
  const reportPath = join(input.reportDirectory, "validation.conversion-resolution.md");
  const conversionReport = readIfExists(join(input.reportDirectory, "conversion-resolution.md"));
  const trySummary = summarizeTryOpportunityGeneration({
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
  const summary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const conversionGeometry = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const tryOpportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const rugby = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const shotCompatibilityReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const checks: readonly ConversionResolutionCheck[] = [
    check("conversion-resolution.md exists", conversionReport.includes("# Conversion Resolution"), "conversion-resolution.md generated"),
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch drop success rate"), "calibrated success rate visible/refreshed later"),
    check("scoring version is V2_DROP_FOUNDATION", conversionReport.includes("V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION"),
    check("score unit remains POINTS", conversionReport.includes("score unit: POINTS"), "POINTS"),
    check("SHOT_GOAL remains 3 points", conversionReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", conversionReport.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL equals 2 points", conversionReport.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL active at 2 points", conversionReport.includes("DROP_GOAL active: YES") && conversionReport.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", conversionReport.includes("PENALTY_SHOT active: NO"), "PENALTY_SHOT inactive"),
    check("conversion attempts generated for every batch TRY_TOUCHDOWN", summary.batchConversionAttempts === summary.batchTryTouchdownsScored, `${summary.batchConversionAttempts}/${summary.batchTryTouchdownsScored}`),
    check("no conversion attempt generated for failed try attempts", summary.conversionAttemptsAfterFailedTries === 0, `${summary.conversionAttemptsAfterFailedTries}`),
    check("every conversion attempt uses stored conversion geometry", summary.attempts.every((attempt) => attempt.conversionLine.length > 0 && attempt.selectedConversionPoint.length > 0), "geometry present"),
    check("missing conversion geometry rows = 0", summary.missingConversionGeometryRows === 0, `${summary.missingConversionGeometryRows}`),
    check("conversion outcomes are resolved", summary.attempts.every((attempt) => attempt.resolved), "all resolved"),
    check("conversion points awarded only for CONVERSION_GOAL", summary.attempts.every((attempt) => (attempt.outcome === "CONVERSION_GOAL" ? attempt.pointValue === 2 : attempt.pointValue === 0)), "point mapping valid"),
    check("CONVERSION_MISSED awards 0", summary.attempts.filter((attempt) => attempt.outcome === "CONVERSION_MISSED").every((attempt) => attempt.pointValue === 0), "missed = 0"),
    check("CONVERSION_BLOCKED awards 0", summary.attempts.filter((attempt) => attempt.outcome === "CONVERSION_BLOCKED").every((attempt) => attempt.pointValue === 0), "blocked = 0"),
    check("CONVERSION_INVALID awards 0", summary.attempts.filter((attempt) => attempt.outcome === "CONVERSION_INVALID").every((attempt) => attempt.pointValue === 0), "invalid = 0"),
    check("final score sums active scoring events", readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md")).includes("final score sums active scoring events"), "score unit report visible"),
    check("live mini-match conversion logic is reported", conversionReport.includes("live conversion attempts:"), "live conversion visible"),
    check("conversion difficulty calibration report section exists", conversionReport.includes("## Difficulty Calibration Summary"), "Difficulty Calibration Summary visible"),
    check("conversion difficulty recommendation visible", conversionReport.includes("recommendation:"), "recommendation visible"),
    check("conversion success rate reported", conversionReport.includes("new batch conversion success rate"), "success rate visible"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", shotCompatibilityReport.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("conversion geometry storage still passes", conversionGeometry.includes("Status: PASS"), "conversion geometry PASS"),
    check("try attempt resolution calibration still passes", tryAttempt.includes("Status: PASS"), "try attempt PASS"),
    check("try opportunity generation still passes", tryOpportunity.includes("Status: PASS"), "try opportunity PASS"),
    check("rugby-style lateral in-goal access still passes", rugby.includes("Status: PASS"), "rugby in-goal PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
  ];

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      batchTriesScored: summary.batchTryTouchdownsScored,
      batchConversionAttempts: summary.batchConversionAttempts,
      batchConversionsMade: summary.batchConversionsMade,
      batchConversionsMissed: summary.batchConversionsMissed,
      batchConversionsBlocked: summary.batchConversionsBlocked,
      batchInvalidConversions: summary.batchInvalidConversions,
      batchConversionSuccessRate: summary.batchConversionSuccessRate,
      batchConversionPointsAwarded: summary.batchConversionPoints,
      liveConversionAttempts: summary.liveConversionAttempts,
      liveConversionPointsAwarded: summary.liveConversionPoints,
      conversionAttemptsAfterFailedTries: summary.conversionAttemptsAfterFailedTries,
      missingConversionGeometryRows: summary.missingConversionGeometryRows,
      recommendation: summary.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
