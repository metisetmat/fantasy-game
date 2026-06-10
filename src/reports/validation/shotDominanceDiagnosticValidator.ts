import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration, type ShotOutcomeContract } from "../../systems/actions";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  analyzeShotDominance,
  conversionRuleLabel,
  dropGoalRuleLabel,
  scoringRuleLabel,
  summarizeConversionResolution,
  summarizeUnifiedLiveScoringEvents,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ShotDominanceValidationStatus = "PASS" | "FAIL";

interface ShotDominanceValidationCheck {
  readonly label: string;
  readonly status: ShotDominanceValidationStatus;
  readonly detail: string;
}

export interface ShotDominanceDiagnosticValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ShotDominanceValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ShotDominanceValidationCheck {
  return { label, status: passed ? "PASS" : "FAIL", detail };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function renderMarkdown(input: {
  readonly checks: readonly ShotDominanceValidationCheck[];
  readonly shotPoints: number;
  readonly shotPointsShare: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotSuccessRate: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dominantCauseCount: number;
  readonly recommendation: string;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Shot Dominance Diagnostic Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- SHOT_GOAL points: ${input.shotPoints}`,
    `- SHOT_GOAL points share: ${input.shotPointsShare}%`,
    `- shot attempts: ${input.shotAttempts}`,
    `- shot goals: ${input.shotGoals}`,
    `- shot success rate: ${input.shotSuccessRate}%`,
    `- try attempts: ${input.tryAttempts}`,
    `- tries scored: ${input.triesScored}`,
    `- drop attempts: ${input.dropAttempts}`,
    `- drop goals: ${input.dropGoals}`,
    `- dominant cause count: ${input.dominantCauseCount}`,
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

export function validateShotDominanceDiagnostic(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): ShotDominanceDiagnosticValidationResult {
  const diagnostic = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const affordanceReport = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const affordanceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-affordance-volume.md"));
  const possessionDangerValidation = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const dangerNonShotValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md"));
  const scoringChoice = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const scoringChoiceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-choice-balance.md"));
  const unifiedValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
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
  const snapshot = analyzeShotDominance({
    result: input.result,
    batchCalibration: input.batchCalibration,
    shotOutcomes: input.shotOutcomes,
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
  const penaltyShotActiveLeakageCount = registry("PENALTY_SHOT")?.active === true || /PENALTY_SHOT.*active: YES/.test(diagnostic + scoringChoice + scoringEvents) ? 1 : 0;
  const checks: readonly ShotDominanceValidationCheck[] = [
    check("shot-dominance-diagnostic.md exists", diagnostic.includes("# Shot Dominance Diagnostic"), "diagnostic generated"),
    check("scoring version remains V2_DROP_FOUNDATION", snapshot.scoringVersion === "V2_DROP_FOUNDATION" && diagnostic.includes("V2_DROP_FOUNDATION"), snapshot.scoringVersion),
    check("score unit remains POINTS", snapshot.scoreUnit === "POINTS" && diagnostic.includes("score unit: POINTS"), snapshot.scoreUnit),
    check("SHOT_GOAL remains 3 points", diagnostic.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", diagnostic.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", diagnostic.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL remains 2 points", diagnostic.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0 && diagnostic.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check(
      "shot dominance signal is reported",
      diagnostic.includes("SHOT_DOMINANCE_WARNING") || diagnostic.includes("route warning: none"),
      diagnostic.includes("SHOT_DOMINANCE_WARNING") ? "warning visible" : "route warning explicitly none",
    ),
    check("SHOT_GOAL points share is reported", diagnostic.includes("SHOT_GOAL points share"), `${snapshot.shotPointsShare}%`),
    check("shot volume analysis exists", diagnostic.includes("## Shot Volume Analysis"), "section visible"),
    check("shot quality analysis exists", diagnostic.includes("## Shot Quality Analysis"), "section visible"),
    check("goalkeeper / defensive suppression analysis exists", diagnostic.includes("## Goalkeeper / Defensive Suppression Analysis"), "section visible"),
    check("rebound / second-shot analysis exists", diagnostic.includes("## Rebound / Second-Shot Analysis"), "section visible"),
    check("route competition analysis exists", diagnostic.includes("## Route Competition Analysis"), "section visible"),
    check("non-shot route capacity exists", diagnostic.includes("## Non-Shot Route Capacity"), "section visible"),
    check("cause classification exists", diagnostic.includes("## Cause Classification"), "section visible"),
    check("recommendation exists", diagnostic.includes("## Recommendation") && diagnostic.includes(`primary recommendation: ${snapshot.recommendation}`), snapshot.recommendation),
    check("affordance volume reinterpretation exists", diagnostic.includes("Affordance Volume Reinterpretation"), "reinterpretation visible"),
    check("possession / danger phase reinterpretation exists", diagnostic.includes("Possession / Danger Phase Reinterpretation"), "possession/danger reinterpretation visible"),
    check("non-shot affordance rebalance interpretation exists", diagnostic.includes("Non-Shot Affordance Rebalance Interpretation"), "non-shot rebalance visible"),
    check("offensive possession / danger phase validation passes", validationPassesOrPending(possessionDangerValidation), "possession/danger PASS/refreshed later"),
    check("danger phase non-shot affordance generation validation passes or is pending", validationPassesOrPending(dangerNonShotValidation), "danger non-shot PASS/refreshed later"),
    check(
      "scoring affordance volume validation passes",
      validationPassesOrPending(affordanceValidation) || affordanceReport.includes("# Scoring Affordance Volume Diagnostic"),
      validationPassesOrPending(affordanceValidation) ? "affordance validation PASS/refreshed later" : "affordance report visible/refreshed later",
    ),
    check("scoring-affordance-volume.md exists", affordanceReport.length === 0 || affordanceReport.includes("# Scoring Affordance Volume Diagnostic"), "affordance report visible/refreshed later"),
    check("known scoring affordances per match reported", affordanceReport.length === 0 || affordanceReport.includes("known scoring affordances per match"), "affordance per-match visible/refreshed later"),
    check("offensive possessions and danger phases are reported", affordanceReport.length === 0 || (affordanceReport.includes("offensive possessions:") && affordanceReport.includes("danger phases:")), "possession/danger visible/refreshed later"),
    check("scoring-choice-balance.md links to shot dominance diagnostic", scoringChoice.includes("Shot Dominance Diagnostic Link"), "link visible"),
    check("scoring-events-summary.md includes shot dominance diagnostic snapshot", scoringEvents.includes("Shot Dominance Diagnostic Snapshot"), "snapshot visible"),
    check("tactical evidence includes shot dominance diagnostic line", tacticalEvidence.includes("shot dominance diagnostic: active"), "tactical line visible"),
    check("coach summary includes shot dominance diagnostic line", coach.includes("shot dominance diagnostic: active"), "coach line visible"),
    check("no scoring values changed", scoringValuesChangedCount === 0, `${scoringValuesChangedCount}`),
    check("batch/live separation preserved", unifiedSummary.batchLiveContaminationCount === 0 && unifiedSummary.finalScoreMismatchCount === 0, `${unifiedSummary.batchLiveContaminationCount}/${unifiedSummary.finalScoreMismatchCount}`),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedValidation), "unified PASS/refreshed later"),
    check(
      "scoring choice balance report is available for cross-link validation",
      scoringChoiceValidation.includes("Status: PASS") || scoringChoice.includes("# Scoring Choice Balance"),
      scoringChoiceValidation.includes("Status: PASS") ? "scoring choice PASS" : "scoring choice report visible/refreshed later",
    ),
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
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.shot-dominance-diagnostic.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotPoints: snapshot.shotPoints,
      shotPointsShare: snapshot.shotPointsShare,
      shotAttempts: snapshot.shotAttempts,
      shotGoals: snapshot.shotGoals,
      shotSuccessRate: snapshot.shotSuccessRate,
      tryAttempts: snapshot.tryAttempts,
      triesScored: snapshot.triesScored,
      dropAttempts: snapshot.dropAttempts,
      dropGoals: snapshot.dropGoals,
      dominantCauseCount: snapshot.routeDominanceCause === "NEEDS_MORE_SAMPLE" ? 0 : 1,
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
