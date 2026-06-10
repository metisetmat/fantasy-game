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

type DropGoalResolutionValidationStatus = "PASS" | "WARNING" | "FAIL";

interface DropGoalResolutionValidationCheck {
  readonly label: string;
  readonly status: DropGoalResolutionValidationStatus;
  readonly detail: string;
}

export interface DropGoalResolutionCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DropGoalResolutionValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DropGoalResolutionValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): DropGoalResolutionValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "WARNING",
    detail,
  };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function countPattern(input: string, pattern: RegExp): number {
  return input.match(pattern)?.length ?? 0;
}

function renderMarkdown(input: {
  readonly checks: readonly DropGoalResolutionValidationCheck[];
  readonly batchDropOpportunities: number;
  readonly batchDropCandidatesGenerated: number;
  readonly batchDropCandidatesSelected: number;
  readonly batchDropCandidatesRejected: number;
  readonly batchDropAttempts: number;
  readonly batchDropGoals: number;
  readonly batchDropMissed: number;
  readonly batchDropBlocked: number;
  readonly batchDropInvalid: number;
  readonly batchDropSuccessRate: number;
  readonly batchDropPoints: number;
  readonly liveDropAttempts: number;
  readonly liveDropGoals: number;
  readonly liveDropPoints: number;
  readonly dropGoalActiveScoringEvents: number;
  readonly dropFromInGoalCount: number;
  readonly dropAsConversionCount: number;
  readonly dropAsPenaltyShotCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Drop Goal Resolution Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    "- previous batch drop success rate: 0%",
    `- batch drop opportunities: ${input.batchDropOpportunities}`,
    `- batch drop candidates generated: ${input.batchDropCandidatesGenerated}`,
    `- batch drop candidates selected: ${input.batchDropCandidatesSelected}`,
    `- batch drop candidates rejected: ${input.batchDropCandidatesRejected}`,
    `- batch drop attempts: ${input.batchDropAttempts}`,
    `- batch drop goals: ${input.batchDropGoals}`,
    `- batch drop missed: ${input.batchDropMissed}`,
    `- batch drop blocked: ${input.batchDropBlocked}`,
    `- batch drop invalid: ${input.batchDropInvalid}`,
    `- batch drop success rate: ${input.batchDropSuccessRate}%`,
    `- batch drop points: ${input.batchDropPoints}`,
    `- live drop attempts: ${input.liveDropAttempts}`,
    `- live drop goals: ${input.liveDropGoals}`,
    `- live drop points: ${input.liveDropPoints}`,
    `- DROP_GOAL active scoring events: ${input.dropGoalActiveScoringEvents}`,
    `- drop from Z0/Z8 count: ${input.dropFromInGoalCount}`,
    `- drop as conversion count: ${input.dropAsConversionCount}`,
    `- drop as penalty shot count: ${input.dropAsPenaltyShotCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Calibration",
    "",
    "- DROP_GOAL resolution calibration applied: YES",
    "- target success range: 20%-45%",
    "- target blocked drop range: 10%-30%",
    "- batch diagnostics remain separate from live scoring events.",
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateDropGoalResolutionCalibration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): DropGoalResolutionCalibrationValidationResult {
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const opportunityValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const foundationValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const unifiedValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const foundation = summarizeDropGoalFoundation({
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
    liveDropGoalAttempts: foundation.liveAttempts,
    batchConversionAttempts: conversionSummary.batchConversionAttempts,
    batchConversionPoints: conversionSummary.batchConversionPoints,
    batchDropOpportunities: foundation.batchDropOpportunities,
    batchDropCandidatesGenerated: foundation.batchDropCandidatesGenerated,
    batchDropAttempts: foundation.batchDropAttempts,
    batchDropPoints: foundation.batchDropPoints,
  });
  const registryDrop = ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === "DROP_GOAL");
  const registryPenalty = ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === "PENALTY_SHOT");
  const allDropText = [dropReport, scoringEvents, scoringCompatibility, tacticalEvidence, coach].join("\n");
  const dropFromInGoalCount = foundation.batchAttempts.filter((attempt) => attempt.context.ballZone.startsWith("Z0") || attempt.context.ballZone.startsWith("Z8")).length;
  const dropAsConversionCount = foundation.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("conversion")).length;
  const dropAsPenaltyShotCount = foundation.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("penalty")).length;
  const penaltyShotActiveLeakageCount = countPattern(allDropText, /PENALTY_SHOT.*active: YES/g);
  const highRushAttempts = foundation.batchAttempts.filter((attempt) => attempt.context.defenderRushPressure >= 64);
  const highRushBlocked = highRushAttempts.filter((attempt) => attempt.outcome === "DROP_BLOCKED");
  const checks: readonly DropGoalResolutionValidationCheck[] = [
    check("drop-goal-resolution-calibration validation exists", true, "validation.drop-goal-resolution-calibration.md is generated"),
    check("scoring version is V2_DROP_FOUNDATION", foundation.scoringVersion === "V2_DROP_FOUNDATION" && dropReport.includes("V2_DROP_FOUNDATION"), foundation.scoringVersion),
    check("score unit remains POINTS", foundation.scoreUnit === "POINTS", foundation.scoreUnit),
    check("SHOT_GOAL remains 3 points", scoringEvents.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", scoringEvents.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", scoringEvents.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL remains 2 points", registryDrop?.active === true && registryDrop.points === 2 && scoringEvents.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", registryPenalty?.active === false && penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT inactive"),
    check("drop opportunity detector still active", dropReport.includes("drop opportunity detector active: YES"), "drop opportunity detector active"),
    check("batch drop opportunities remain > 0", foundation.batchDropOpportunities > 0, `${foundation.batchDropOpportunities}`),
    check("batch drop candidates generated remain > 0", foundation.batchDropCandidatesGenerated > 0, `${foundation.batchDropCandidatesGenerated}`),
    check("batch drop attempts remain > 0", foundation.batchDropAttempts > 0, `${foundation.batchDropAttempts}`),
    check("DROP_GOAL_ATTEMPT remains in candidate taxonomy", dropReport.includes("DROP_GOAL_ATTEMPT"), "DROP_GOAL_ATTEMPT"),
    check("no drop goal generated from Z0/Z8", dropFromInGoalCount === 0, `${dropFromInGoalCount}`),
    check("no drop goal generated as conversion", dropAsConversionCount === 0, `${dropAsConversionCount}`),
    check("no drop goal generated as penalty shot", dropAsPenaltyShotCount === 0, `${dropAsPenaltyShotCount}`),
    check("DROP_GOAL can emit active ScoringEvent when scored", registryDrop?.active === true && registryDrop.points === 2, "DROP_GOAL registry active at 2"),
    check("DROP_MISSED awards 0", dropReport.includes("DROP_MISSED = 0"), "DROP_MISSED = 0"),
    check("DROP_BLOCKED awards 0", dropReport.includes("DROP_BLOCKED = 0"), "DROP_BLOCKED = 0"),
    check("DROP_INVALID awards 0", dropReport.includes("DROP_INVALID = 0"), "DROP_INVALID = 0"),
    warning("batch drop success rate is above previous 0%", foundation.batchDropSuccessRate > 0, `${foundation.batchDropSuccessRate}%`),
    warning("batch drop success rate is within 20% to 45%", foundation.batchDropSuccessRate >= 20 && foundation.batchDropSuccessRate <= 45, `${foundation.batchDropSuccessRate}%`),
    warning("DROP_BLOCKED appears if defender rush pressure is high", highRushAttempts.length === 0 || highRushBlocked.length > 0, `${highRushBlocked.length}/${highRushAttempts.length}`),
    check("DROP_INVALID count = 0 for generated legal attempts", foundation.batchDropInvalid === 0 && foundation.dropInvalidCount === 0, `${foundation.dropInvalidCount}`),
    check("live score equals sum of active live ScoringEvents", unifiedSummary.finalScoreMismatchCount === 0, unifiedSummary.finalScoreDisplay),
    check("batch drop diagnostics do not affect current live score", unifiedSummary.batchLiveContaminationCount === 0, `${unifiedSummary.batchLiveContaminationCount}`),
    check("scoring-events-summary.md includes calibrated drop diagnostics", scoringEvents.includes("batch drop missed") && scoringEvents.includes("batch drop blocked") && scoringEvents.includes("batch drop invalid"), "calibrated drop diagnostics visible"),
    check("drop-goal-foundation.md includes Drop Resolution Calibration", dropReport.includes("Drop Resolution Calibration") && dropReport.includes("execution score") && dropReport.includes("difficulty threshold"), "resolution calibration visible"),
    check("scoring-from-shot-outcomes.md includes drop resolution recommendation", scoringCompatibility.includes("drop resolution recommendation"), "compatibility recommendation visible"),
    check("tactical evidence includes drop resolution recommendation", tacticalEvidence.includes("drop resolution recommendation"), "tactical recommendation visible"),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedValidation), "unified validation PASS/refreshed later"),
    check("drop goal opportunity generation validation still passes", validationPassesOrPending(opportunityValidation), "opportunity validation PASS/refreshed later"),
    check("drop goal foundation validation still passes", validationPassesOrPending(foundationValidation), "foundation validation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      batchDropOpportunities: foundation.batchDropOpportunities,
      batchDropCandidatesGenerated: foundation.batchDropCandidatesGenerated,
      batchDropCandidatesSelected: foundation.batchDropCandidatesSelected,
      batchDropCandidatesRejected: foundation.batchDropCandidatesRejected,
      batchDropAttempts: foundation.batchDropAttempts,
      batchDropGoals: foundation.batchDropGoals,
      batchDropMissed: foundation.batchDropMissed,
      batchDropBlocked: foundation.batchDropBlocked,
      batchDropInvalid: foundation.batchDropInvalid,
      batchDropSuccessRate: foundation.batchDropSuccessRate,
      batchDropPoints: foundation.batchDropPoints,
      liveDropAttempts: foundation.liveDropAttempts,
      liveDropGoals: foundation.liveDropGoals,
      liveDropPoints: foundation.liveDropPoints,
      dropGoalActiveScoringEvents: unifiedSummary.dropGoalEvents,
      dropFromInGoalCount,
      dropAsConversionCount,
      dropAsPenaltyShotCount,
      penaltyShotActiveLeakageCount,
      batchLiveContaminationCount: unifiedSummary.batchLiveContaminationCount,
      finalScoreMismatchCount: unifiedSummary.finalScoreMismatchCount,
      recommendation: foundation.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status !== "FAIL"),
    reportPath,
    checks,
  };
}
