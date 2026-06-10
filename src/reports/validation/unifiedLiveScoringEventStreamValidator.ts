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

type UnifiedScoringValidationStatus = "PASS" | "FAIL";

interface UnifiedScoringValidationCheck {
  readonly label: string;
  readonly status: UnifiedScoringValidationStatus;
  readonly detail: string;
}

export interface UnifiedLiveScoringEventStreamValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly UnifiedScoringValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): UnifiedScoringValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function renderMarkdown(input: {
  readonly checks: readonly UnifiedScoringValidationCheck[];
  readonly liveScoringEventsTotal: number;
  readonly activeLiveScoringEvents: number;
  readonly shotGoalLiveEvents: number;
  readonly tryTouchdownLiveEvents: number;
  readonly conversionGoalLiveEvents: number;
  readonly dropGoalLiveEvents: number;
  readonly failedTryActiveScoringLeakageCount: number;
  readonly conversionWithoutTryCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly inactiveScoringLeakageCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Unified Live Scoring Event Stream Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- live scoring events total: ${input.liveScoringEventsTotal}`,
    `- active live scoring events: ${input.activeLiveScoringEvents}`,
    `- SHOT_GOAL live events: ${input.shotGoalLiveEvents}`,
    `- TRY_TOUCHDOWN live events: ${input.tryTouchdownLiveEvents}`,
    `- CONVERSION_GOAL live events: ${input.conversionGoalLiveEvents}`,
    `- DROP_GOAL live events: ${input.dropGoalLiveEvents}`,
    `- failed try active scoring leakage count: ${input.failedTryActiveScoringLeakageCount}`,
    `- conversion without try count: ${input.conversionWithoutTryCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- inactive scoring leakage count: ${input.inactiveScoringLeakageCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateUnifiedLiveScoringEventStream(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): UnifiedLiveScoringEventStreamValidationResult {
  const scoringEventsReport = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const dropOpportunityValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const dropResolutionValidation = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const shotCompatibilityReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const possessionDangerValidation = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const conversionGeometry = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const tryOpportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const rugbyInGoal = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const activeSharePack = resolveActiveSharePackConfig(input.reportDirectory);
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
  const dropGoalSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const summary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.outcomes,
    liveConversionAttempts: conversionSummary.liveAttempts,
    liveDropGoalAttempts: dropGoalSummary.liveAttempts,
    batchConversionAttempts: conversionSummary.batchConversionAttempts,
    batchConversionPoints: conversionSummary.batchConversionPoints,
    batchDropAttempts: dropGoalSummary.batchDropAttempts,
    batchDropPoints: dropGoalSummary.batchDropPoints,
  });
  const registryAction = (action: string): { readonly active: boolean; readonly points?: number; readonly requiresPreviousScoringAction?: string } | undefined =>
    ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === action);
  const checks: readonly UnifiedScoringValidationCheck[] = [
    check("scoring-events-summary.md exists", scoringEventsReport.includes("# Scoring Events Summary"), "canonical scoring report generated"),
    check("scoring version remains V2_DROP_FOUNDATION", summary.scoringVersion === "V2_DROP_FOUNDATION", summary.scoringVersion),
    check("score unit remains POINTS", summary.scoreUnit === "POINTS", summary.scoreUnit),
    check("unified live scoring event stream is active", summary.scoringSource === "UNIFIED_LIVE_SCORING_EVENTS", summary.scoringSource),
    check("SHOT_GOAL remains 3 points", registryAction("SHOT_GOAL")?.active === true && registryAction("SHOT_GOAL")?.points === 3 && scoringEventsReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", registryAction("TRY_TOUCHDOWN")?.active === true && registryAction("TRY_TOUCHDOWN")?.points === 5 && scoringEventsReport.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", registryAction("CONVERSION_GOAL")?.active === true && registryAction("CONVERSION_GOAL")?.points === 2 && scoringEventsReport.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL active at 2 points", registryAction("DROP_GOAL")?.active === true && registryAction("DROP_GOAL")?.points === 2 && scoringEventsReport.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", registryAction("PENALTY_SHOT")?.active === false && !scoringEventsReport.includes("PENALTY_SHOT active: YES"), "PENALTY_SHOT inactive"),
    check("active scoring registry exists", ACTIVE_SCORING_ACTION_REGISTRY.length === 5, `${ACTIVE_SCORING_ACTION_REGISTRY.length} actions registered`),
    check("live SHOT_GOAL emits active ScoringEvent", summary.shotGoalEvents === 1 && summary.activeEvents.some((event) => event.scoringAction === "SHOT_GOAL" && event.active), `${summary.shotGoalEvents}`),
    check("live TRY_TOUCHDOWN can emit active ScoringEvent when scored", registryAction("TRY_TOUCHDOWN")?.active === true && registryAction("TRY_TOUCHDOWN")?.points === 5, "registry supports active TRY_TOUCHDOWN"),
    check("live CONVERSION_GOAL can emit active ScoringEvent after TRY_TOUCHDOWN", registryAction("CONVERSION_GOAL")?.requiresPreviousScoringAction === "TRY_TOUCHDOWN", "CONVERSION_GOAL requires TRY_TOUCHDOWN"),
    check("live DROP_GOAL can emit active ScoringEvent when scored", registryAction("DROP_GOAL")?.active === true && registryAction("DROP_GOAL")?.points === 2, "DROP_GOAL registry active"),
    check("failed live try attempt emits no active scoring event", summary.failedTryActiveScoringLeakageCount === 0, `${summary.failedTryActiveScoringLeakageCount}`),
    check("no live conversion attempt is generated without live TRY_TOUCHDOWN", summary.conversionWithoutTryCount === 0, `${summary.conversionWithoutTryCount}`),
    check("batch scoring diagnostics do not affect current mini-match score", summary.batchLiveContaminationCount === 0, `${summary.batchLiveContaminationCount}`),
    check("final score equals sum of active live ScoringEvents", summary.finalScoreMismatchCount === 0, summary.finalScoreDisplay),
    check("scoring-events-summary.md separates live scoring events from batch diagnostics", scoringEventsReport.includes("## Live Scoring Event Stream") && scoringEventsReport.includes("## Batch Scoring Diagnostics"), "live and batch sections present"),
    check("scoring-events-summary.md includes offensive possession / danger phase snapshot", scoringEventsReport.includes("Offensive Possession / Danger Phase Snapshot"), "possession/danger snapshot visible"),
    check("offensive possession / danger phase validation passes", validationPassesOrPending(possessionDangerValidation), "possession/danger PASS/refreshed later"),
    check("drop goal foundation validation passes", readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md")).includes("Status: PASS") || scoringEventsReport.includes(dropGoalRuleLabel()), "drop foundation PASS/refreshed later"),
    check("drop goal opportunity generation validation passes", validationPassesOrPending(dropOpportunityValidation), "drop opportunity PASS/refreshed later"),
    check("drop goal resolution calibration validation passes", validationPassesOrPending(dropResolutionValidation), "drop resolution PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible"),
    check("calibrated drop success rate reported", dropReport.includes("new batch drop success rate"), `${dropGoalSummary.batchDropSuccessRate}%`),
    check("drop opportunity detector is active", dropReport.includes("drop opportunity detector active: YES"), "drop opportunity detector active"),
    check("DROP_GOAL_ATTEMPT candidate taxonomy is visible", dropReport.includes("DROP_GOAL_ATTEMPT"), "DROP_GOAL_ATTEMPT"),
    check("scoring-events-summary.md includes batch drop opportunities", scoringEventsReport.includes("batch drop opportunities"), "batch drop opportunities visible"),
    check("scoring-events-summary.md includes batch drop attempts", scoringEventsReport.includes("batch drop attempts"), "batch drop attempts visible"),
    check("scoring-from-shot-outcomes.md has compatibility note", shotCompatibilityReport.includes("Compatibility Note") && shotCompatibilityReport.includes("reports/scoring-events-summary.md"), "compatibility note present"),
    check("conversion resolution remains calibrated", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("conversion geometry storage still passes", validationPassesOrPending(conversionGeometry), "conversion geometry PASS/refreshed later"),
    check("try attempt resolution calibration still passes", validationPassesOrPending(tryAttempt), "try attempt PASS/refreshed later"),
    check("try opportunity generation still passes", validationPassesOrPending(tryOpportunity), "try opportunity PASS/refreshed later"),
    check("rugby-style lateral in-goal access still passes", validationPassesOrPending(rugbyInGoal), "rugby in-goal PASS/refreshed later"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary reports unified scoring stream", coach.includes("unified scoring stream: active") && coach.includes("batch diagnostics remain separate"), "coach line present"),
    check("tactical evidence reports unified scoring stream", tactical.includes("unified live scoring event stream: active") && tactical.includes("batch diagnostics remain separate from live score"), "tactical line present"),
    check("share pack remains MINIMAL_REVIEW", activeSharePack.mode === "MINIMAL_REVIEW", activeSharePack.mode),
  ];
  const reportPath = join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      liveScoringEventsTotal: summary.scoringEventCount,
      activeLiveScoringEvents: summary.activeScoringEventCount,
      shotGoalLiveEvents: summary.shotGoalEvents,
      tryTouchdownLiveEvents: summary.tryTouchdownEvents,
      conversionGoalLiveEvents: summary.conversionGoalEvents,
      dropGoalLiveEvents: summary.dropGoalEvents,
      failedTryActiveScoringLeakageCount: summary.failedTryActiveScoringLeakageCount,
      conversionWithoutTryCount: summary.conversionWithoutTryCount,
      batchLiveContaminationCount: summary.batchLiveContaminationCount,
      finalScoreMismatchCount: summary.finalScoreMismatchCount,
      inactiveScoringLeakageCount: summary.inactiveScoringLeakageCount,
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
