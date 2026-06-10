import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  summarizeConversionResolution,
  summarizeNonShotResolutionRebalance,
  summarizeUnifiedLiveScoringEvents,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type NonShotResolutionRebalanceStatus = "PASS" | "WARNING" | "FAIL";

interface NonShotResolutionRebalanceCheck {
  readonly label: string;
  readonly status: NonShotResolutionRebalanceStatus;
  readonly detail: string;
}

export interface NonShotResolutionRebalanceValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly NonShotResolutionRebalanceCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): NonShotResolutionRebalanceCheck {
  return { label, status: passed ? "PASS" : "FAIL", detail };
}

function warning(label: string, passed: boolean, detail: string): NonShotResolutionRebalanceCheck {
  return { label, status: passed ? "PASS" : "WARNING", detail };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function registry(action: string): { readonly points?: number | undefined; readonly active: boolean } | undefined {
  return ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === action);
}

function renderMarkdown(input: {
  readonly checks: readonly NonShotResolutionRebalanceCheck[];
  readonly previousConversionSuccessRate: number;
  readonly newConversionAttempts: number;
  readonly newConversionsMade: number;
  readonly newConversionSuccessRate: number;
  readonly conversionPointsAwarded: number;
  readonly conversionAttemptsAfterFailedTries: number;
  readonly missingConversionGeometryRows: number;
  readonly previousDropSuccessRate: number;
  readonly newDropAttempts: number;
  readonly newDropGoals: number;
  readonly newDropMissed: number;
  readonly newDropBlocked: number;
  readonly newDropInvalid: number;
  readonly newDropSuccessRate: number;
  readonly dropBlockedRate: number;
  readonly dropPoints: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryScoringRate: number;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status !== "FAIL") ? "PASS" : "FAIL";

  return [
    "# Non-Shot Resolution Rebalance Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- previous conversion success rate: ${input.previousConversionSuccessRate}%`,
    `- new conversion attempts: ${input.newConversionAttempts}`,
    `- new conversions made: ${input.newConversionsMade}`,
    `- new conversion success rate: ${input.newConversionSuccessRate}%`,
    `- conversion points awarded: ${input.conversionPointsAwarded}`,
    `- conversion attempts after failed tries: ${input.conversionAttemptsAfterFailedTries}`,
    `- missing conversion geometry rows: ${input.missingConversionGeometryRows}`,
    `- previous drop success rate: ${input.previousDropSuccessRate}%`,
    `- new drop attempts: ${input.newDropAttempts}`,
    `- new drop goals: ${input.newDropGoals}`,
    `- new drop missed: ${input.newDropMissed}`,
    `- new drop blocked: ${input.newDropBlocked}`,
    `- new drop invalid: ${input.newDropInvalid}`,
    `- new drop success rate: ${input.newDropSuccessRate}%`,
    `- drop blocked rate: ${input.dropBlockedRate}%`,
    `- drop points: ${input.dropPoints}`,
    `- try attempts: ${input.tryAttempts}`,
    `- tries scored: ${input.triesScored}`,
    `- try scoring rate: ${input.tryScoringRate}%`,
    `- scoring values changed count: ${input.scoringValuesChangedCount}`,
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

export function validateNonShotResolutionRebalance(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): NonShotResolutionRebalanceValidationResult {
  const report = readIfExists(join(input.reportDirectory, "non-shot-resolution-rebalance.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringAffordance = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const shotDominance = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const scoringChoice = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const dangerNonShot = readIfExists(join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md"));
  const offensivePossession = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const affordanceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-affordance-volume.md"));
  const shotDominanceValidation = readIfExists(join(input.reportDirectory, "validation.shot-dominance-diagnostic.md"));
  const scoringChoiceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-choice-balance.md"));
  const unifiedLive = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropOpportunity = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const dropFoundation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolutionValidation = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
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
  const dropSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const summary = summarizeNonShotResolutionRebalance({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const unifiedSummary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    liveConversionAttempts: conversionSummary.liveAttempts,
    liveDropGoalAttempts: dropSummary.liveAttempts,
    batchConversionAttempts: conversionSummary.batchConversionAttempts,
    batchConversionPoints: conversionSummary.batchConversionPoints,
    batchDropOpportunities: dropSummary.batchDropOpportunities,
    batchDropCandidatesGenerated: dropSummary.batchDropCandidatesGenerated,
    batchDropAttempts: dropSummary.batchDropAttempts,
    batchDropPoints: dropSummary.batchDropPoints,
  });
  const scoringValuesChangedCount = [
    registry("SHOT_GOAL")?.points === 3,
    registry("TRY_TOUCHDOWN")?.points === 5,
    registry("CONVERSION_GOAL")?.points === 2,
    registry("DROP_GOAL")?.points === 2,
  ].filter((item) => !item).length;
  const combined = report + scoringEvents + scoringAffordance + shotDominance + scoringChoice;
  const penaltyShotActiveLeakageCount = registry("PENALTY_SHOT")?.active === true || /PENALTY_SHOT.*active: YES/.test(combined) ? 1 : 0;
  const dropFromInGoalCount = dropSummary.batchAttempts.filter((attempt) => attempt.context.ballZone.startsWith("Z0") || attempt.context.ballZone.startsWith("Z8")).length;
  const dropAsConversionCount = dropSummary.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("conversion")).length;
  const dropAsPenaltyCount = dropSummary.batchAttempts.filter((attempt) => attempt.context.actionId.toLowerCase().includes("penalty")).length;
  const setupScoringEventCount = /NON_SHOT_SETUP.*(point value: [1-9]|scoring event)/.test(combined) ? 1 : 0;
  const checks: readonly NonShotResolutionRebalanceCheck[] = [
    check("non-shot-resolution-rebalance.md exists", report.includes("# Non-Shot Resolution Rebalance"), "report generated"),
    check("scoring version remains V2_DROP_FOUNDATION", summary.scoringVersion === "V2_DROP_FOUNDATION", summary.scoringVersion),
    check("score unit remains POINTS", summary.scoreUnit === "POINTS", summary.scoreUnit),
    check("SHOT_GOAL remains 3 points", registry("SHOT_GOAL")?.points === 3 && report.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points"),
    check("TRY_TOUCHDOWN remains 5 points", registry("TRY_TOUCHDOWN")?.points === 5 && report.includes("TRY_TOUCHDOWN = 5 points"), "TRY_TOUCHDOWN = 5 points"),
    check("CONVERSION_GOAL remains 2 points", registry("CONVERSION_GOAL")?.points === 2 && report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION_GOAL = 2 points"),
    check("DROP_GOAL remains 2 points", registry("DROP_GOAL")?.points === 2 && report.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0 && report.includes("PENALTY_SHOT"), "PENALTY_SHOT inactive"),
    check("danger phase non-shot affordance generation still passes", dangerNonShot.includes("Status: PASS"), "danger non-shot PASS"),
    check("non-shot affordance counts are reported", report.includes("TRY_TOUCHDOWN") && report.includes("DROP_GOAL") && report.includes("non-shot"), "counts visible"),
    check("conversion resolution rebalance is reported", report.includes("## Conversion Rebalance Detail"), "conversion detail visible"),
    check("drop resolution rebalance is reported", report.includes("## Drop Rebalance Detail"), "drop detail visible"),
    check("try resolution is monitored but not directly buffed", report.includes("try resolution is watched only"), "watch-only visible"),
    check("conversion attempts generated only after TRY_TOUCHDOWN", conversionSummary.batchConversionAttempts === conversionSummary.batchTryTouchdownsScored, `${conversionSummary.batchConversionAttempts}/${conversionSummary.batchTryTouchdownsScored}`),
    check("conversion attempts after failed tries = 0", conversionSummary.conversionAttemptsAfterFailedTries === 0, `${conversionSummary.conversionAttemptsAfterFailedTries}`),
    check("conversion missing geometry rows = 0", conversionSummary.missingConversionGeometryRows === 0, `${conversionSummary.missingConversionGeometryRows}`),
    warning("conversion success rate is above previous 0%", summary.conversionSuccessRate > summary.previousConversionSuccessRate, `${summary.conversionSuccessRate}%`),
    warning("conversion success rate is within 60%-80%", summary.conversionSuccessRate >= 60 && summary.conversionSuccessRate <= 80, `${summary.conversionSuccessRate}%`),
    check("drop invalid count = 0", dropSummary.batchDropInvalid === 0, `${dropSummary.batchDropInvalid}`),
    check("no drop goal generated from Z0/Z8", dropFromInGoalCount === 0, `${dropFromInGoalCount}`),
    check("no drop goal generated as conversion", dropAsConversionCount === 0, `${dropAsConversionCount}`),
    check("no drop goal generated as penalty shot", dropAsPenaltyCount === 0, `${dropAsPenaltyCount}`),
    warning("drop success rate is above previous 13%", summary.dropSuccessRate > summary.previousDropSuccessRate, `${summary.dropSuccessRate}%`),
    warning("drop success rate is within 20%-45%", summary.dropSuccessRate >= 20 && summary.dropSuccessRate <= 45, `${summary.dropSuccessRate}%`),
    check("no setup affordance creates points directly", setupScoringEventCount === 0, `${setupScoringEventCount}`),
    check("scoring-events-summary.md includes non-shot resolution rebalance snapshot", scoringEvents.includes("Non-Shot Resolution Rebalance Snapshot"), "event snapshot visible"),
    check("scoring-affordance-volume.md includes non-shot resolution rebalance snapshot", scoringAffordance.includes("Non-Shot Resolution Rebalance Snapshot"), "affordance snapshot visible"),
    check("shot-dominance-diagnostic.md includes non-shot resolution rebalance interpretation", shotDominance.includes("Non-Shot Resolution Rebalance Interpretation"), "shot dominance interpretation visible"),
    check("scoring-choice-balance.md includes non-shot resolution balance", scoringChoice.includes("Non-Shot Resolution Balance"), "choice balance visible"),
    check("scoring-from-shot-outcomes.md links non-shot resolution rebalance report", scoringCompatibility.includes("non-shot resolution rebalance report"), "compatibility link visible"),
    check("tactical evidence includes non-shot resolution rebalance", tacticalEvidence.includes("non-shot resolution rebalance: active"), "tactical line visible"),
    check(
      "coach summary includes non-shot resolution rebalance",
      coachSummary.includes("non-shot resolution rebalance: active") || coachSummary.includes("conversion/drop/try resolution:"),
      "coach line visible",
    ),
    check("no scoring values changed", scoringValuesChangedCount === 0, `${scoringValuesChangedCount}`),
    check("batch/live separation preserved", unifiedSummary.batchLiveContaminationCount === 0 && unifiedSummary.finalScoreMismatchCount === 0, `${unifiedSummary.batchLiveContaminationCount}/${unifiedSummary.finalScoreMismatchCount}`),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedLive), "unified PASS/refreshed later"),
    check("scoring affordance volume validation still passes", validationPassesOrPending(affordanceValidation), "affordance PASS/refreshed later"),
    check("offensive possession / danger phase validation still passes", validationPassesOrPending(offensivePossession), "possession PASS/refreshed later"),
    check("shot dominance diagnostic validation still passes", validationPassesOrPending(shotDominanceValidation), "shot dominance PASS/refreshed later"),
    check("scoring choice balance validation still passes", validationPassesOrPending(scoringChoiceValidation), "choice PASS/refreshed later"),
    check("drop goal resolution calibration still passes", validationPassesOrPending(dropResolution), "drop resolution PASS/refreshed later"),
    check("drop goal opportunity generation still passes", validationPassesOrPending(dropOpportunity), "drop opportunity PASS/refreshed later"),
    check("drop goal foundation still passes", validationPassesOrPending(dropFoundation), "drop foundation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolutionValidation), "conversion PASS/refreshed later"),
    check("try candidate/executed integration still passes", validationPassesOrPending(tryCandidate), "try candidate PASS/refreshed later"),
    check("live try event integration still passes", validationPassesOrPending(liveTry), "live try PASS/refreshed later"),
    check("shot validations still pass", validationPassesOrPending(shotOutcome) && validationPassesOrPending(shotSemantics), "shot validations PASS/refreshed later"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.non-shot-resolution-rebalance.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      previousConversionSuccessRate: summary.previousConversionSuccessRate,
      newConversionAttempts: summary.conversionAttempts,
      newConversionsMade: summary.conversionsMade,
      newConversionSuccessRate: summary.conversionSuccessRate,
      conversionPointsAwarded: summary.conversionPoints,
      conversionAttemptsAfterFailedTries: summary.conversionAttemptsAfterFailedTries,
      missingConversionGeometryRows: summary.missingConversionGeometryRows,
      previousDropSuccessRate: summary.previousDropSuccessRate,
      newDropAttempts: summary.dropAttempts,
      newDropGoals: summary.dropGoals,
      newDropMissed: summary.dropMissed,
      newDropBlocked: summary.dropBlocked,
      newDropInvalid: summary.dropInvalid,
      newDropSuccessRate: summary.dropSuccessRate,
      dropBlockedRate: summary.dropBlockedRate,
      dropPoints: summary.dropPoints,
      tryAttempts: summary.tryAttempts,
      triesScored: summary.triesScored,
      tryScoringRate: summary.tryScoringRate,
      scoringValuesChangedCount,
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
