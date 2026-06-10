import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration, type ShotOutcomeContract } from "../../systems/actions";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  analyzeScoringAffordanceVolume,
  conversionRuleLabel,
  dropGoalRuleLabel,
  scoringRuleLabel,
  summarizeConversionResolution,
  summarizeUnifiedLiveScoringEvents,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ScoringAffordanceVolumeValidationStatus = "PASS" | "FAIL";

interface ScoringAffordanceVolumeCheck {
  readonly label: string;
  readonly status: ScoringAffordanceVolumeValidationStatus;
  readonly detail: string;
}

export interface ScoringAffordanceVolumeValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScoringAffordanceVolumeCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ScoringAffordanceVolumeCheck {
  return { label, status: passed ? "PASS" : "FAIL", detail };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function hasCoachScoringAffordanceLine(coach: string): boolean {
  return coach.includes("scoring affordance volume diagnostic: active") || coach.includes("non-shot affordance share:");
}

function renderMarkdown(input: {
  readonly checks: readonly ScoringAffordanceVolumeCheck[];
  readonly knownExcludingConversion: number;
  readonly knownIncludingConversion: number;
  readonly perMatchExcludingConversion: number;
  readonly perTeamPerMatchExcludingConversion: number;
  readonly shotAffordances: number;
  readonly tryAffordances: number;
  readonly dropAffordances: number;
  readonly conversionAffordances: number;
  readonly nonShotAffordanceShare: number;
  readonly offensivePossessionsAvailableCount: number;
  readonly dangerPhasesAvailableCount: number;
  readonly affordanceStarvationWarningCount: number;
  readonly nonShotAffordanceStarvationWarningCount: number;
  readonly liveBatchAffordanceGapWarningCount: number;
  readonly recommendation: string;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Scoring Affordance Volume Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- known scoring affordances excluding conversion: ${input.knownExcludingConversion}`,
    `- known scoring affordances including conversion: ${input.knownIncludingConversion}`,
    `- known scoring affordances per match excluding conversion: ${input.perMatchExcludingConversion}`,
    `- known scoring affordances per team per match excluding conversion: ${input.perTeamPerMatchExcludingConversion}`,
    `- shot affordances / candidates: ${input.shotAffordances}`,
    `- try affordances / opportunities: ${input.tryAffordances}`,
    `- drop affordances / opportunities: ${input.dropAffordances}`,
    `- conversion affordances: ${input.conversionAffordances}`,
    `- non-shot affordance share: ${input.nonShotAffordanceShare}%`,
    `- offensive possessions available count: ${input.offensivePossessionsAvailableCount}`,
    `- danger phases available count: ${input.dangerPhasesAvailableCount}`,
    `- affordance starvation warning count: ${input.affordanceStarvationWarningCount}`,
    `- non-shot affordance starvation warning count: ${input.nonShotAffordanceStarvationWarningCount}`,
    `- live/batch affordance gap warning count: ${input.liveBatchAffordanceGapWarningCount}`,
    `- recommendation: ${input.recommendation}`,
    `- scoring values changed count: ${input.scoringValuesChangedCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScoringAffordanceVolume(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): ScoringAffordanceVolumeValidationResult {
  const report = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const shotDominance = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const scoringChoice = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const possessionDangerReport = readIfExists(join(input.reportDirectory, "offensive-possession-danger-phase.md"));
  const possessionDangerValidation = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const dangerNonShotValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const unifiedValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const shotDominanceValidation = readIfExists(join(input.reportDirectory, "validation.shot-dominance-diagnostic.md"));
  const scoringChoiceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-choice-balance.md"));
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
  const snapshot = analyzeScoringAffordanceVolume({
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
  const dropSummary = summarizeDropGoalFoundation({
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
  const registry = (action: string): { readonly points?: number | undefined; readonly active: boolean } | undefined =>
    ACTIVE_SCORING_ACTION_REGISTRY.find((item) => item.action === action);
  const scoringValuesChangedCount = [
    registry("SHOT_GOAL")?.points === 3,
    registry("TRY_TOUCHDOWN")?.points === 5,
    registry("CONVERSION_GOAL")?.points === 2,
    registry("DROP_GOAL")?.points === 2,
  ].filter((item) => !item).length;
  const penaltyShotActiveLeakageCount = registry("PENALTY_SHOT")?.active === true || /PENALTY_SHOT.*active: YES/.test(report + scoringChoice + scoringEvents) ? 1 : 0;
  const checks: readonly ScoringAffordanceVolumeCheck[] = [
    check("scoring-affordance-volume.md exists", report.includes("# Scoring Affordance Volume Diagnostic"), "report generated"),
    check("scoring version remains V2_DROP_FOUNDATION", snapshot.scoringVersion === "V2_DROP_FOUNDATION" && report.includes("V2_DROP_FOUNDATION"), snapshot.scoringVersion),
    check("score unit remains POINTS", snapshot.scoreUnit === "POINTS" && report.includes("score unit: POINTS"), snapshot.scoreUnit),
    check("SHOT_GOAL remains 3 points", report.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", report.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", report.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL remains 2 points", report.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0 && report.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("terminology contract exists", report.includes("## Terminology Contract"), "terminology visible"),
    check("known scoring affordance volume is reported", report.includes("## Known Scoring Affordance Volume"), "known volume visible"),
    check("affordance funnel is reported", report.includes("## Affordance Funnel"), "funnel visible"),
    check("offensive possession / danger phase volume section exists", report.includes("## Offensive Possession / Danger Phase Volume"), "section visible"),
    check("offensive possessions and danger phases are reported", snapshot.offensivePossessions > 0 && snapshot.dangerPhases > 0, `${snapshot.offensivePossessions}/${snapshot.dangerPhases}`),
    check("scoring-affordance-volume.md links to offensive possession / danger phase report", report.includes("Possession/Danger Instrumentation Link") && report.includes("offensive-possession-danger-phase.md"), "possession/danger link visible"),
    check("offensive-possession-danger-phase.md exists", possessionDangerReport.includes("# Offensive Possession & Danger Phase Instrumentation"), "canonical possession/danger report visible"),
    check("missing possession/danger links are reported", report.includes("possession link coverage") && report.includes("danger phase link coverage"), "link coverage visible"),
    check("live vs batch affordance gap is reported", report.includes("## Live vs Batch Affordance Gap"), "gap visible"),
    check("non-shot affordance volume is reported", report.includes("## Non-Shot Affordance Volume"), "non-shot volume visible"),
    check("non-shot affordance generation snapshot is reported", report.includes("## Non-Shot Affordance Generation Snapshot"), "non-shot generation visible"),
    check("affordance starvation warnings are reported", report.includes("## Affordance Starvation Warnings"), "warnings visible"),
    check("recommendation exists", report.includes("## Recommendation") && report.includes(`primary recommendation: ${snapshot.recommendation}`), snapshot.recommendation),
    check("shot-dominance-diagnostic.md includes affordance volume reinterpretation", shotDominance.includes("Affordance Volume Reinterpretation"), "reinterpretation visible"),
    check("scoring-choice-balance.md links to scoring affordance volume diagnostic", scoringChoice.includes("Scoring Affordance Volume Link"), "affordance link visible"),
    check("scoring-events-summary.md includes scoring affordance volume snapshot", scoringEvents.includes("Scoring Affordance Volume Snapshot"), "snapshot visible"),
    check("tactical evidence includes scoring affordance volume line", tacticalEvidence.includes("scoring affordance volume diagnostic: active"), "tactical line visible"),
    check("coach summary includes scoring affordance volume line", hasCoachScoringAffordanceLine(coach), "coach line visible"),
    check("no scoring values changed", scoringValuesChangedCount === 0, `${scoringValuesChangedCount}`),
    check("batch/live separation preserved", unifiedSummary.batchLiveContaminationCount === 0 && unifiedSummary.finalScoreMismatchCount === 0, `${unifiedSummary.batchLiveContaminationCount}/${unifiedSummary.finalScoreMismatchCount}`),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedValidation), "unified PASS/refreshed later"),
    check("shot dominance diagnostic validation still passes", validationPassesOrPending(shotDominanceValidation), "shot dominance PASS/refreshed later"),
    check("scoring choice balance validation still passes", scoringChoiceValidation.includes("Status: PASS"), "scoring choice PASS"),
    check("drop goal resolution calibration still passes", validationPassesOrPending(dropResolution), "drop resolution PASS/refreshed later"),
    check("drop goal opportunity generation still passes", validationPassesOrPending(dropOpportunity), "drop opportunity PASS/refreshed later"),
    check("drop goal foundation still passes", validationPassesOrPending(dropFoundation), "drop foundation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolutionValidation), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("offensive possession / danger phase validation passes", validationPassesOrPending(possessionDangerValidation), "possession/danger PASS/refreshed later"),
    check("danger phase non-shot affordance generation validation passes or is pending", validationPassesOrPending(dangerNonShotValidation), "danger non-shot PASS/refreshed later"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.scoring-affordance-volume.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      knownExcludingConversion: snapshot.totalKnownScoringAffordances,
      knownIncludingConversion: snapshot.totalKnownScoringAffordancesIncludingConversion,
      perMatchExcludingConversion: snapshot.knownScoringAffordancesPerMatch,
      perTeamPerMatchExcludingConversion: snapshot.knownScoringAffordancesPerTeamPerMatch,
      shotAffordances: snapshot.shotAffordances,
      tryAffordances: snapshot.tryAffordances,
      dropAffordances: snapshot.dropAffordances,
      conversionAffordances: snapshot.conversionAffordances,
      nonShotAffordanceShare: snapshot.nonShotAffordanceShare,
      offensivePossessionsAvailableCount: snapshot.offensivePossessions > 0 ? 1 : 0,
      dangerPhasesAvailableCount: snapshot.dangerPhases > 0 ? 1 : 0,
      affordanceStarvationWarningCount: snapshot.scoringAffordanceStarvationWarning === "none" ? 0 : 1,
      nonShotAffordanceStarvationWarningCount: snapshot.nonShotAffordanceStarvationWarning === "none" ? 0 : 1,
      liveBatchAffordanceGapWarningCount: snapshot.liveAffordanceStarvationWarning === "none" ? 0 : 1,
      recommendation: snapshot.recommendation,
      scoringValuesChangedCount,
      penaltyShotActiveLeakageCount,
      batchLiveContaminationCount: unifiedSummary.batchLiveContaminationCount,
      finalScoreMismatchCount: unifiedSummary.finalScoreMismatchCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
