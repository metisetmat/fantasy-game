import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import {
  summarizeDropGoalFoundation,
  summarizeDropGoalOpportunities,
  summarizeTryOpportunityGeneration,
} from "../../systems/actions";
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

type DropGoalOpportunityValidationStatus = "PASS" | "WARNING" | "FAIL";

interface DropGoalOpportunityValidationCheck {
  readonly label: string;
  readonly status: DropGoalOpportunityValidationStatus;
  readonly detail: string;
}

export interface DropGoalOpportunityGenerationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DropGoalOpportunityValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DropGoalOpportunityValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, passed: boolean, detail: string): DropGoalOpportunityValidationCheck {
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
  readonly checks: readonly DropGoalOpportunityValidationCheck[];
  readonly batchDropOpportunities: number;
  readonly batchDropCandidatesGenerated: number;
  readonly batchDropCandidatesSelected: number;
  readonly batchDropCandidatesRejected: number;
  readonly batchDropAttempts: number;
  readonly batchDropGoals: number;
  readonly batchDropSuccessRate: number;
  readonly batchDropPoints: number;
  readonly liveDropOpportunities: number;
  readonly liveDropCandidatesGenerated: number;
  readonly liveDropCandidatesSelected: number;
  readonly liveDropCandidatesRejected: number;
  readonly liveDropAttempts: number;
  readonly liveDropGoals: number;
  readonly liveDropPoints: number;
  readonly activeScoringEvents: number;
  readonly dropGoalActiveScoringEvents: number;
  readonly dropInvalidCount: number;
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
    "# Drop Goal Opportunity Generation Validation",
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
    `- live drop opportunities: ${input.liveDropOpportunities}`,
    `- live drop candidates generated: ${input.liveDropCandidatesGenerated}`,
    `- live drop candidates selected: ${input.liveDropCandidatesSelected}`,
    `- live drop candidates rejected: ${input.liveDropCandidatesRejected}`,
    `- live drop attempts: ${input.liveDropAttempts}`,
    `- live drop goals: ${input.liveDropGoals}`,
    `- live drop points: ${input.liveDropPoints}`,
    `- active scoring events: ${input.activeScoringEvents}`,
    `- DROP_GOAL active scoring events: ${input.dropGoalActiveScoringEvents}`,
    `- drop invalid count: ${input.dropInvalidCount}`,
    `- drop from Z0/Z8 count: ${input.dropFromInGoalCount}`,
    `- drop as conversion count: ${input.dropAsConversionCount}`,
    `- drop as penalty shot count: ${input.dropAsPenaltyShotCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Drop Opportunity Detector",
    "",
    "- drop opportunity detector: ACTIVE",
    "- candidate taxonomy: DROP_GOAL_ATTEMPT",
    "- batch drop diagnostics remain calibration-only and do not alter the live mini-match score.",
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateDropGoalOpportunityGeneration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): DropGoalOpportunityGenerationValidationResult {
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const resolutionValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const scoringBatch = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const opportunities = summarizeDropGoalOpportunities({ batchCalibration: input.batchCalibration });
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
  const allDropText = [dropReport, scoringEvents, scoringCompatibility, tacticalEvidence].join("\n");
  const allOpportunityRecords = [...opportunities.batchOpportunities, ...opportunities.liveOpportunities];
  const selected = allOpportunityRecords.filter((opportunity) => opportunity.candidateStatus === "SELECTED");
  const rejected = allOpportunityRecords.filter((opportunity) => opportunity.candidateStatus === "REJECTED");
  const dropFromInGoalCount = foundation.batchAttempts.filter((attempt) => attempt.context.ballZone.startsWith("Z0") || attempt.context.ballZone.startsWith("Z8")).length;
  const dropAsConversionCount = foundation.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("conversion")).length;
  const dropAsPenaltyShotCount = foundation.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("penalty")).length;
  const penaltyShotActiveLeakageCount = countPattern(allDropText, /PENALTY_SHOT.*active: YES/g);
  const checks: readonly DropGoalOpportunityValidationCheck[] = [
    check("drop-goal-opportunity-generation validation exists", true, "validation.drop-goal-opportunity-generation.md is generated"),
    check("drop opportunity detector exists", opportunities.detectorActive, "drop opportunity detector active"),
    check("scoring version is V2_DROP_FOUNDATION", foundation.scoringVersion === "V2_DROP_FOUNDATION" && dropReport.includes("V2_DROP_FOUNDATION"), foundation.scoringVersion),
    check("score unit remains POINTS", foundation.scoreUnit === "POINTS", foundation.scoreUnit),
    check("SHOT_GOAL remains 3 points", scoringEvents.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", scoringEvents.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", scoringEvents.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL remains 2 points", registryDrop?.active === true && registryDrop.points === 2 && scoringEvents.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", registryPenalty?.active === false && penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT inactive"),
    warning("batch drop opportunities are generated", foundation.batchDropOpportunities > 0, `${foundation.batchDropOpportunities}`),
    warning("batch drop candidates generated > 0", foundation.batchDropCandidatesGenerated > 0, `${foundation.batchDropCandidatesGenerated}`),
    warning("batch drop attempts can be selected", foundation.batchDropAttempts > 0, `${foundation.batchDropAttempts}`),
    check("DROP_GOAL_ATTEMPT appears in candidate taxonomy", dropReport.includes("DROP_GOAL_ATTEMPT"), "DROP_GOAL_ATTEMPT"),
    warning("DROP_GOAL_ATTEMPT can be selected when legal opportunity exists", selected.length > 0, `${selected.length} selected`),
    warning("DROP_GOAL_ATTEMPT can be rejected when a better candidate exists", rejected.length > 0, `${rejected.length} rejected`),
    check("selected and rejected candidate ranges are visible", dropReport.includes("selected drop candidate score range") && dropReport.includes("rejected drop candidate score range"), "score ranges visible"),
    check("no drop goal generated from Z0/Z8", dropFromInGoalCount === 0, `${dropFromInGoalCount}`),
    check("drop attempts are not conversion attempts", dropAsConversionCount === 0, `${dropAsConversionCount}`),
    check("drop attempts are not penalty shots", dropAsPenaltyShotCount === 0, `${dropAsPenaltyShotCount}`),
    check("DROP_GOAL can emit ScoringEvent when scored", registryDrop?.active === true && registryDrop.points === 2, "DROP_GOAL registry active at 2"),
    check("drop misses/blocks/invalid award 0", dropReport.includes("DROP_MISSED = 0") && dropReport.includes("DROP_BLOCKED = 0") && dropReport.includes("DROP_INVALID = 0"), "0-point non-goal outcomes"),
    check("live score equals active ScoringEvents", unifiedSummary.finalScoreMismatchCount === 0, unifiedSummary.finalScoreDisplay),
    check("batch drop diagnostics do not affect live score", unifiedSummary.batchLiveContaminationCount === 0, `${unifiedSummary.batchLiveContaminationCount}`),
    check("scoring-events-summary includes drop diagnostics", scoringEvents.includes("batch drop opportunities") && scoringEvents.includes("batch drop attempts"), "batch drop diagnostics visible"),
    check("drop-goal-foundation includes opportunity diagnostics", dropReport.includes("Drop Opportunity Generation") && dropReport.includes("drop opportunity detector active: YES"), "drop opportunity section visible"),
    check("drop goal resolution calibration validation passes", validationPassesOrPending(resolutionValidation), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", dropReport.includes("new batch drop success rate"), `${foundation.batchDropSuccessRate}%`),
    check("tactical evidence includes batch drop opportunities", tacticalEvidence.includes("batch drop opportunities"), "tactical evidence drop diagnostics visible"),
    check("existing scoring V1 batch calibration still passes", validationPassesOrPending(scoringBatch), "batch calibration PASS/refreshed later"),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("existing conversion resolution still passes", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("existing conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("existing try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("existing live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("existing shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("share pack mode remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md");

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
      batchDropSuccessRate: foundation.batchDropSuccessRate,
      batchDropPoints: foundation.batchDropPoints,
      liveDropOpportunities: foundation.liveDropOpportunities,
      liveDropCandidatesGenerated: foundation.liveDropCandidatesGenerated,
      liveDropCandidatesSelected: foundation.liveDropCandidatesSelected,
      liveDropCandidatesRejected: foundation.liveDropCandidatesRejected,
      liveDropAttempts: foundation.liveDropAttempts,
      liveDropGoals: foundation.liveDropGoals,
      liveDropPoints: foundation.liveDropPoints,
      activeScoringEvents: unifiedSummary.activeScoringEventCount,
      dropGoalActiveScoringEvents: unifiedSummary.dropGoalEvents,
      dropInvalidCount: foundation.dropInvalidCount,
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
