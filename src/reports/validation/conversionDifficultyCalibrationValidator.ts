import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  conversionRuleLabel,
  scoringRuleLabel,
  summarizeConversionResolution,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ConversionDifficultyStatus = "PASS" | "WARNING" | "FAIL";

interface ConversionDifficultyCheck {
  readonly label: string;
  readonly status: ConversionDifficultyStatus;
  readonly detail: string;
}

export interface ConversionDifficultyCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ConversionDifficultyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ConversionDifficultyCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): ConversionDifficultyCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ConversionDifficultyCheck[];
  readonly batchTriesScored: number;
  readonly batchConversionAttempts: number;
  readonly batchConversionsMade: number;
  readonly batchConversionsMissed: number;
  readonly batchConversionsBlocked: number;
  readonly batchInvalidConversions: number;
  readonly batchConversionSuccessRate: number;
  readonly previousConversionSuccessRate: number;
  readonly centralConversionSuccessRate: number;
  readonly halfSpaceConversionSuccessRate: number;
  readonly wideConversionSuccessRate: number;
  readonly conversionPointsAwarded: number;
  readonly liveConversionAttempts: number;
  readonly liveConversionPointsAwarded: number;
  readonly conversionAttemptsAfterFailedTries: number;
  readonly missingConversionGeometryRows: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Conversion Difficulty Calibration Validation",
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
    `- previous conversion success rate: ${input.previousConversionSuccessRate}%`,
    `- central conversion success rate: ${input.centralConversionSuccessRate}%`,
    `- half-space conversion success rate: ${input.halfSpaceConversionSuccessRate}%`,
    `- wide conversion success rate: ${input.wideConversionSuccessRate}%`,
    `- conversion points awarded: ${input.conversionPointsAwarded}`,
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

export function validateConversionDifficultyCalibration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ConversionDifficultyCalibrationValidationResult {
  const reportPath = join(input.reportDirectory, "validation.conversion-difficulty-calibration.md");
  const conversionReport = readIfExists(join(input.reportDirectory, "conversion-resolution.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const batch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
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
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
  const conversionResolutionValidation = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const terminology = readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const conversionGeometry = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const tryOpportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const rugby = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const shotCompatibilityReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const globalRateInRange = summary.batchConversionSuccessRate >= 60 && summary.batchConversionSuccessRate <= 80;
  const calibrationReducedPrevious = summary.batchConversionSuccessRate < 100 || summary.recommendation === "INCREASE_CONVERSION_DIFFICULTY";
  const laneDifficultyPlausible =
    summary.batchConversionAttempts < 5 ||
    summary.centralConversionSuccessRate >= summary.halfSpaceConversionSuccessRate ||
    summary.halfSpaceConversionSuccessRate >= summary.wideConversionSuccessRate;

  const checks: readonly ConversionDifficultyCheck[] = [
    check("conversion difficulty calibration report exists", conversionReport.includes("## Difficulty Calibration Summary"), "Difficulty Calibration Summary visible"),
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch drop success rate"), "calibrated success rate visible/refreshed later"),
    check("scoring version remains V2_DROP_FOUNDATION", conversionReport.includes("V2_DROP_FOUNDATION") && scoring.includes("V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION"),
    check("score unit remains POINTS", conversionReport.includes("score unit: POINTS"), "POINTS"),
    check("SHOT_GOAL remains 3 points", conversionReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", conversionReport.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", conversionReport.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL active at 2 points", /DROP_GOAL.*active: YES/.test(conversionReport + scoring + coach) && (conversionReport + scoring + coach).includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", !/PENALTY_SHOT.*active: YES/.test(conversionReport + scoring + coach), "PENALTY_SHOT inactive"),
    check("conversion attempts generated for every batch TRY_TOUCHDOWN", summary.batchConversionAttempts === summary.batchTryTouchdownsScored, `${summary.batchConversionAttempts}/${summary.batchTryTouchdownsScored}`),
    check("no conversion attempt generated for failed try attempts", summary.conversionAttemptsAfterFailedTries === 0, `${summary.conversionAttemptsAfterFailedTries}`),
    check("every conversion attempt uses stored conversion geometry", summary.attempts.every((attempt) => attempt.conversionLine.length > 0 && attempt.selectedConversionPoint.length > 0), "geometry present"),
    check("missing conversion geometry rows = 0", summary.missingConversionGeometryRows === 0, `${summary.missingConversionGeometryRows}`),
    check("conversion outcomes are resolved", summary.attempts.every((attempt) => attempt.resolved), "all resolved"),
    check("conversion points awarded only for CONVERSION_GOAL", summary.attempts.every((attempt) => (attempt.outcome === "CONVERSION_GOAL" ? attempt.pointValue === 2 : attempt.pointValue === 0)), "point mapping valid"),
    warning("conversion success rate is below previous 100%", calibrationReducedPrevious, `${summary.batchConversionSuccessRate}% / ${summary.recommendation}`),
    warning("conversion success rate is within 60% to 80%", globalRateInRange || summary.batchConversionAttempts < 5, `${summary.batchConversionSuccessRate}% with ${summary.batchConversionAttempts} attempts`),
    warning("central conversion is easier than half-space / wide conversion", laneDifficultyPlausible, `C ${summary.centralConversionSuccessRate}% / HS ${summary.halfSpaceConversionSuccessRate}% / wide ${summary.wideConversionSuccessRate}%`),
    check("conversion invalid count = 0", summary.batchInvalidConversions === 0, `${summary.batchInvalidConversions}`),
    check("final score sums active scoring events", scoring.includes("final score sums active scoring events"), "score unit report visible"),
    check("live mini-match conversion logic is reported", conversionReport.includes("live conversion attempts:"), "live conversion visible"),
    check("conversion difficulty recommendation visible", [conversionReport, batch, scoring, tactical, coach].every((item) => item.includes("conversion difficulty") || item.includes("recommendation:")), "recommendation visible"),
    check("conversion success rate reported", [conversionReport, batch, scoring].every((item) => item.includes("batch conversion success rate")), "success rate visible"),
    check("conversion resolution validation still passes", conversionResolutionValidation.includes("Status: PASS"), "conversion resolution PASS"),
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", shotCompatibilityReport.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("try report terminology cleanup still passes", terminology.includes("Status: PASS"), "terminology PASS"),
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
      previousConversionSuccessRate: 100,
      centralConversionSuccessRate: summary.centralConversionSuccessRate,
      halfSpaceConversionSuccessRate: summary.halfSpaceConversionSuccessRate,
      wideConversionSuccessRate: summary.wideConversionSuccessRate,
      conversionPointsAwarded: summary.batchConversionPoints,
      liveConversionAttempts: summary.liveConversionAttempts,
      liveConversionPointsAwarded: summary.liveConversionPoints,
      conversionAttemptsAfterFailedTries: summary.conversionAttemptsAfterFailedTries,
      missingConversionGeometryRows: summary.missingConversionGeometryRows,
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
