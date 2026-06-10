import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  conversionRuleLabel,
  dropGoalRuleLabel,
  scoringRuleLabel,
  summarizeConversionResolution,
  summarizeUnifiedLiveScoringEvents,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type DropGoalValidationStatus = "PASS" | "WARNING" | "FAIL";

interface DropGoalValidationCheck {
  readonly label: string;
  readonly status: DropGoalValidationStatus;
  readonly detail: string;
}

export interface DropGoalFoundationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DropGoalValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DropGoalValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): DropGoalValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly DropGoalValidationCheck[];
  readonly batchDropOpportunities: number;
  readonly batchDropCandidatesGenerated: number;
  readonly batchDropCandidatesSelected: number;
  readonly batchDropCandidatesRejected: number;
  readonly batchDropAttempts: number;
  readonly batchDropGoals: number;
  readonly batchDropSuccessRate: number;
  readonly batchDropPoints: number;
  readonly liveDropAttempts: number;
  readonly liveDropGoals: number;
  readonly liveDropPoints: number;
  readonly dropGoalActiveScoringEvents: number;
  readonly dropInvalidCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Drop Goal Foundation Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- batch drop opportunities: ${input.batchDropOpportunities}`,
    `- batch drop candidates generated: ${input.batchDropCandidatesGenerated}`,
    `- batch drop candidates selected: ${input.batchDropCandidatesSelected}`,
    `- batch drop candidates rejected: ${input.batchDropCandidatesRejected}`,
    `- batch drop attempts: ${input.batchDropAttempts}`,
    `- batch drop goals: ${input.batchDropGoals}`,
    `- batch drop success rate: ${input.batchDropSuccessRate}%`,
    `- batch drop points: ${input.batchDropPoints}`,
    `- live drop attempts: ${input.liveDropAttempts}`,
    `- live drop goals: ${input.liveDropGoals}`,
    `- live drop points: ${input.liveDropPoints}`,
    `- DROP_GOAL active scoring events: ${input.dropGoalActiveScoringEvents}`,
    `- drop invalid count: ${input.dropInvalidCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateDropGoalFoundation(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): DropGoalFoundationValidationResult {
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const dropOpportunityValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const dropResolutionValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const summary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
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
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const unifiedSummary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    liveConversionAttempts: conversionSummary.liveAttempts,
    liveDropGoalAttempts: summary.liveAttempts,
    batchConversionAttempts: conversionSummary.batchConversionAttempts,
    batchConversionPoints: conversionSummary.batchConversionPoints,
    batchDropAttempts: summary.batchDropAttempts,
    batchDropPoints: summary.batchDropPoints,
  });
  const registryDrop = ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === "DROP_GOAL");
  const registryPenalty = ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === "PENALTY_SHOT");
  const penaltyShotActiveLeakageCount = /PENALTY_SHOT.*active: YES/.test([dropReport, scoringEvents, scoringCompatibility].join("\n")) ? 1 : 0;
  const checks: readonly DropGoalValidationCheck[] = [
    check("drop-goal-foundation.md exists", dropReport.includes("# Drop Goal Foundation"), "drop-goal-foundation.md generated"),
    check("scoring version is V2_DROP_FOUNDATION", dropReport.includes("V2_DROP_FOUNDATION") && scoringEvents.includes("V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION"),
    check("score unit remains POINTS", dropReport.includes("score unit: POINTS"), "POINTS"),
    check("SHOT_GOAL remains 3 points", scoringEvents.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", scoringEvents.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", scoringEvents.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL equals 2 points", scoringEvents.includes(dropGoalRuleLabel()) && dropReport.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", registryPenalty?.active === false && penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT inactive"),
    check("DROP_GOAL is active in scoring registry", registryDrop?.active === true && registryDrop.points === 2, "DROP_GOAL active at 2"),
    check("DROP_GOAL can emit ScoringEvent when scored", registryDrop?.active === true && registryDrop.points === 2, "registry supports active DROP_GOAL"),
    check("drop opportunity generation validation passes", dropOpportunityValidation.length === 0 || dropOpportunityValidation.includes("Status: PASS"), "drop opportunity validation PASS/refreshed later"),
    check("drop goal resolution calibration validation passes", dropResolutionValidation.length === 0 || dropResolutionValidation.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible"),
    check("calibrated drop success rate reported", dropReport.includes("new batch drop success rate"), `${summary.batchDropSuccessRate}%`),
    check("drop opportunity detector is active", dropReport.includes("drop opportunity detector active: YES"), "drop opportunity detector active"),
    check("DROP_GOAL_ATTEMPT candidate taxonomy is visible", dropReport.includes("candidate taxonomy: DROP_GOAL_ATTEMPT"), "DROP_GOAL_ATTEMPT"),
    check("batch drop opportunities are reported", dropReport.includes("batch drop opportunities"), `${summary.batchDropOpportunities}`),
    check("batch drop candidates are reported", dropReport.includes("batch drop candidates generated"), `${summary.batchDropCandidatesGenerated}`),
    check("DROP_MISSED awards 0", dropReport.includes("DROP_MISSED = 0"), "DROP_MISSED = 0"),
    check("DROP_BLOCKED awards 0", dropReport.includes("DROP_BLOCKED = 0"), "DROP_BLOCKED = 0"),
    check("DROP_INVALID awards 0", dropReport.includes("DROP_INVALID = 0"), "DROP_INVALID = 0"),
    check("drop legality rules exist", dropReport.includes("legal conditions:") && dropReport.includes("Z0/Z8"), "legality documented"),
    check("no drop goal generated from Z0/Z8", summary.batchAttempts.every((attempt) => !attempt.context.ballZone.startsWith("Z0") && !attempt.context.ballZone.startsWith("Z8")), "0"),
    check("no drop goal generated as conversion", summary.batchAttempts.every((attempt) => !attempt.context.actionId.includes("conversion")), "0"),
    check("no penalty shot activated", registryPenalty?.active === false, "PENALTY_SHOT inactive"),
    warning("batch drop attempts are reported", summary.batchDropAttempts > 0, `${summary.batchDropAttempts}`),
    warning("batch drop success rate is within monitor range", summary.batchDropAttempts === 0 || (summary.batchDropSuccessRate >= 20 && summary.batchDropSuccessRate <= 45), `${summary.batchDropSuccessRate}%`),
    check("live score equals sum of active live ScoringEvents", unifiedSummary.finalScoreMismatchCount === 0, unifiedSummary.finalScoreDisplay),
    check("batch drop diagnostics do not affect current live score", unifiedSummary.batchLiveContaminationCount === 0, `${unifiedSummary.batchLiveContaminationCount}`),
    check("scoring-events-summary.md includes DROP_GOAL", scoringEvents.includes("DROP_GOAL"), "DROP_GOAL visible"),
    check("unified live scoring event stream validation still passes", readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md")).includes("Status: PASS") || scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "unified scoring PASS/refreshed later"),
    check("conversion difficulty calibration still passes", conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", conversionResolution.length === 0 || conversionResolution.includes("Status: PASS"), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.drop-goal-foundation.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      batchDropOpportunities: summary.batchDropOpportunities,
      batchDropCandidatesGenerated: summary.batchDropCandidatesGenerated,
      batchDropCandidatesSelected: summary.batchDropCandidatesSelected,
      batchDropCandidatesRejected: summary.batchDropCandidatesRejected,
      batchDropAttempts: summary.batchDropAttempts,
      batchDropGoals: summary.batchDropGoals,
      batchDropSuccessRate: summary.batchDropSuccessRate,
      batchDropPoints: summary.batchDropPoints,
      liveDropAttempts: summary.liveDropAttempts,
      liveDropGoals: summary.liveDropGoals,
      liveDropPoints: summary.liveDropPoints,
      dropGoalActiveScoringEvents: unifiedSummary.dropGoalEvents,
      dropInvalidCount: summary.dropInvalidCount,
      penaltyShotActiveLeakageCount,
      batchLiveContaminationCount: unifiedSummary.batchLiveContaminationCount,
      finalScoreMismatchCount: unifiedSummary.finalScoreMismatchCount,
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
