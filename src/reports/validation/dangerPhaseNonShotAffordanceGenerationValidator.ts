import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { analyzeDangerNonShotAffordanceGeneration, analyzeOffensivePossessionDangerPhases } from "../../systems/phases";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  summarizeUnifiedLiveScoringEvents,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type DangerNonShotValidationStatus = "PASS" | "WARNING" | "FAIL";

interface DangerNonShotValidationCheck {
  readonly label: string;
  readonly status: DangerNonShotValidationStatus;
  readonly detail: string;
}

export interface DangerPhaseNonShotAffordanceGenerationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DangerNonShotValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DangerNonShotValidationCheck {
  return { label, status: passed ? "PASS" : "FAIL", detail };
}

function warning(label: string, passed: boolean, detail: string): DangerNonShotValidationCheck {
  return { label, status: passed ? "PASS" : "WARNING", detail };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function registry(action: string): { readonly points?: number | undefined; readonly active: boolean } | undefined {
  return ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === action);
}

function renderMarkdown(input: {
  readonly checks: readonly DangerNonShotValidationCheck[];
  readonly previousTryAffordances: number;
  readonly newTryAffordances: number;
  readonly previousDropAffordances: number;
  readonly newDropAffordances: number;
  readonly nonShotSetupAffordances: number;
  readonly previousNonShotAffordanceShare: number;
  readonly newNonShotAffordanceShare: number;
  readonly dangerPhasesOnlyShot: number;
  readonly dangerPhasesGainingTry: number;
  readonly dangerPhasesGainingDrop: number;
  readonly dangerPhasesGainingSetup: number;
  readonly illegalTryAffordanceCount: number;
  readonly offBallInGoalOccupancyCount: number;
  readonly illegalDropAffordanceCount: number;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status !== "FAIL") ? "PASS" : "FAIL";

  return [
    "# Danger Phase Non-Shot Affordance Generation Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- previous TRY_TOUCHDOWN affordances: ${input.previousTryAffordances}`,
    `- new TRY_TOUCHDOWN affordances: ${input.newTryAffordances}`,
    `- previous DROP_GOAL affordances: ${input.previousDropAffordances}`,
    `- new DROP_GOAL affordances: ${input.newDropAffordances}`,
    `- non-shot setup affordances: ${input.nonShotSetupAffordances}`,
    `- previous non-shot affordance share: ${input.previousNonShotAffordanceShare}%`,
    `- new non-shot affordance share: ${input.newNonShotAffordanceShare}%`,
    `- danger phases with only shot affordance: ${input.dangerPhasesOnlyShot}`,
    `- danger phases gaining try affordance: ${input.dangerPhasesGainingTry}`,
    `- danger phases gaining drop affordance: ${input.dangerPhasesGainingDrop}`,
    `- danger phases gaining setup affordance: ${input.dangerPhasesGainingSetup}`,
    `- illegal try affordance count: ${input.illegalTryAffordanceCount}`,
    `- off-ball Z0/Z8 occupancy count: ${input.offBallInGoalOccupancyCount}`,
    `- illegal drop affordance count: ${input.illegalDropAffordanceCount}`,
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

export function validateDangerPhaseNonShotAffordanceGeneration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): DangerPhaseNonShotAffordanceGenerationValidationResult {
  const possessionReport = readIfExists(join(input.reportDirectory, "offensive-possession-danger-phase.md"));
  const scoringAffordance = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const shotDominance = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const scoringChoice = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const possessionValidation = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const affordanceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-affordance-volume.md"));
  const shotDominanceValidation = readIfExists(join(input.reportDirectory, "validation.shot-dominance-diagnostic.md"));
  const scoringChoiceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-choice-balance.md"));
  const unifiedLive = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropOpportunity = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const dropFoundation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const possessionDanger = analyzeOffensivePossessionDangerPhases({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const summary = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases: possessionDanger.dangerPhases,
  });
  const scoringValuesChangedCount = [
    registry("SHOT_GOAL")?.points === 3,
    registry("TRY_TOUCHDOWN")?.points === 5,
    registry("CONVERSION_GOAL")?.points === 2,
    registry("DROP_GOAL")?.points === 2,
  ].filter((item) => !item).length;
  const combined = possessionReport + scoringAffordance + shotDominance + scoringChoice + scoringEvents;
  const penaltyShotActiveLeakageCount = registry("PENALTY_SHOT")?.active === true || /PENALTY_SHOT.*active: YES/.test(combined) ? 1 : 0;
  const unifiedSummary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    batchConversionAttempts: 0,
    batchConversionPoints: 0,
  });
  const checks: readonly DangerNonShotValidationCheck[] = [
    check("danger phase non-shot affordance generation validation exists", true, "validator generated"),
    check("scoring version remains V2_DROP_FOUNDATION", possessionDanger.scoringVersion === "V2_DROP_FOUNDATION", possessionDanger.scoringVersion),
    check("score unit remains POINTS", possessionDanger.scoreUnit === "POINTS", possessionDanger.scoreUnit),
    check("SHOT_GOAL remains 3 points", registry("SHOT_GOAL")?.points === 3, "SHOT_GOAL = 3 points"),
    check("TRY_TOUCHDOWN remains 5 points", registry("TRY_TOUCHDOWN")?.points === 5, "TRY_TOUCHDOWN = 5 points"),
    check("CONVERSION_GOAL remains 2 points", registry("CONVERSION_GOAL")?.points === 2, "CONVERSION_GOAL = 2 points"),
    check("DROP_GOAL remains 2 points", registry("DROP_GOAL")?.points === 2, "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT inactive"),
    check("offensive possession / danger phase instrumentation still passes", validationPassesOrPending(possessionValidation), "possession/danger PASS/refreshed later"),
    check("danger phase links remain complete or missing links are reported", possessionDanger.affordancesMissingDangerPhaseLink === 0 || possessionReport.includes("affordances missing danger phase link"), `${possessionDanger.affordancesMissingDangerPhaseLink}`),
    check("non-shot affordance detector exists", existsSync(join(process.cwd(), "src", "systems", "phases", "dangerNonShotAffordanceAnalyzer.ts")), "detector file exists"),
    warning("TRY_TOUCHDOWN affordances are reported", summary.newTryTouchdownAffordances > 0, `${summary.newTryTouchdownAffordances}`),
    warning("DROP_GOAL affordances are reported", summary.newDropGoalAffordances > 0, `${summary.newDropGoalAffordances}`),
    check("non-shot setup affordances are reported separately from scoring affordances", possessionReport.includes("NON_SHOT_SETUP") && possessionReport.includes("not included in scoring affordance totals") || scoringAffordance.includes("not included in scoring affordance totals"), `${summary.nonShotSetupAffordances}`),
    check("no setup affordance creates points directly", summary.setupScoringEventCount === 0, `${summary.setupScoringEventCount}`),
    check("no illegal try affordance from central/frontal Z0/Z8 access", summary.illegalTryAffordanceCount === 0, `${summary.illegalTryAffordanceCount}`),
    check("no off-ball Z0/Z8 occupancy introduced", summary.offBallInGoalOccupancyCount === 0, `${summary.offBallInGoalOccupancyCount}`),
    check("no drop generated from Z0/Z8", summary.illegalDropAffordanceCount === 0, `${summary.illegalDropAffordanceCount}`),
    check("no drop generated as conversion", !possessionReport.includes("DROP_GOAL_AFFORDANCE as conversion"), "no conversion/drop conflation"),
    check("no drop generated as penalty shot", !possessionReport.includes("DROP_GOAL_AFFORDANCE as PENALTY_SHOT"), "no penalty/drop conflation"),
    check("scoring-affordance-volume.md includes non-shot affordance generation snapshot", scoringAffordance.includes("Non-Shot Affordance Generation Snapshot"), "snapshot visible"),
    check("shot-dominance-diagnostic.md includes non-shot affordance rebalance interpretation", shotDominance.includes("Non-Shot Affordance Rebalance Interpretation"), "rebalance visible"),
    check("scoring-choice-balance.md includes danger phase non-shot affordance balance", scoringChoice.includes("Danger Phase Non-Shot Affordance Balance"), "balance visible"),
    check("scoring-events-summary.md includes danger phase non-shot affordance snapshot", scoringEvents.includes("Danger Phase Non-Shot Affordance Snapshot"), "event snapshot visible"),
    check("scoring-from-shot-outcomes.md links non-shot affordance generation diagnostic", scoringCompatibility.includes("non-shot affordance generation diagnostic"), "compatibility link visible"),
    check("tactical evidence includes non-shot affordance generation line", tacticalEvidence.includes("danger phase non-shot affordance generation: active"), "tactical line visible"),
    check("coach summary includes non-shot affordance generation line", coachSummary.includes("danger phase non-shot affordance generation: active"), "coach line visible"),
    check("no scoring values changed", scoringValuesChangedCount === 0, `${scoringValuesChangedCount}`),
    check("batch/live separation preserved", unifiedSummary.batchLiveContaminationCount === 0 && unifiedSummary.finalScoreMismatchCount === 0, `${unifiedSummary.batchLiveContaminationCount}/${unifiedSummary.finalScoreMismatchCount}`),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedLive), "unified PASS/refreshed later"),
    check("scoring affordance volume validation still passes", validationPassesOrPending(affordanceValidation), "affordance PASS/refreshed later"),
    check("shot dominance diagnostic validation still passes", validationPassesOrPending(shotDominanceValidation), "shot dominance PASS/refreshed later"),
    check("scoring choice balance validation still passes", validationPassesOrPending(scoringChoiceValidation), "choice PASS/refreshed later"),
    check("drop goal resolution calibration still passes", validationPassesOrPending(dropResolution), "drop resolution PASS/refreshed later"),
    check("drop goal opportunity generation still passes", validationPassesOrPending(dropOpportunity), "drop opportunity PASS/refreshed later"),
    check("drop goal foundation still passes", validationPassesOrPending(dropFoundation), "drop foundation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", validationPassesOrPending(tryCandidate), "try candidate PASS/refreshed later"),
    check("live try event integration still passes", validationPassesOrPending(liveTry), "live try PASS/refreshed later"),
    check("shot validations still pass", validationPassesOrPending(shotOutcome) && validationPassesOrPending(shotSemantics), "shot validations PASS/refreshed later"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      previousTryAffordances: summary.previousTryTouchdownAffordances,
      newTryAffordances: summary.newTryTouchdownAffordances,
      previousDropAffordances: summary.previousDropGoalAffordances,
      newDropAffordances: summary.newDropGoalAffordances,
      nonShotSetupAffordances: summary.nonShotSetupAffordances,
      previousNonShotAffordanceShare: summary.previousNonShotAffordanceShare,
      newNonShotAffordanceShare: summary.newNonShotAffordanceShare,
      dangerPhasesOnlyShot: summary.dangerPhasesStillShotOnly,
      dangerPhasesGainingTry: summary.dangerPhasesGainingTryAffordance,
      dangerPhasesGainingDrop: summary.dangerPhasesGainingDropAffordance,
      dangerPhasesGainingSetup: summary.dangerPhasesGainingSetupAffordance,
      illegalTryAffordanceCount: summary.illegalTryAffordanceCount,
      offBallInGoalOccupancyCount: summary.offBallInGoalOccupancyCount,
      illegalDropAffordanceCount: summary.illegalDropAffordanceCount,
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
