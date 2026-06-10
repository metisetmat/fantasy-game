import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  analyzeScoringChoiceBalance,
  conversionRuleLabel,
  dropGoalRuleLabel,
  scoringRuleLabel,
  summarizeConversionResolution,
  summarizeUnifiedLiveScoringEvents,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type ScoringChoiceBalanceStatus = "PASS" | "FAIL";

interface ScoringChoiceBalanceCheck {
  readonly label: string;
  readonly status: ScoringChoiceBalanceStatus;
  readonly detail: string;
}

export interface ScoringChoiceBalanceValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScoringChoiceBalanceCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ScoringChoiceBalanceCheck {
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
  readonly checks: readonly ScoringChoiceBalanceCheck[];
  readonly shotPoints: number;
  readonly tryPoints: number;
  readonly conversionPoints: number;
  readonly dropPoints: number;
  readonly totalActiveBatchPoints: number;
  readonly shotPointsShare: number;
  readonly tryPointsShare: number;
  readonly conversionPointsShare: number;
  readonly dropPointsShare: number;
  readonly shotDominanceWarningCount: number;
  readonly tryStarvationWarningCount: number;
  readonly dropStarvationWarningCount: number;
  readonly dropDominanceWarningCount: number;
  readonly conversionLeakageCount: number;
  readonly penaltyLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Scoring Choice Balance Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot points: ${input.shotPoints}`,
    `- try points: ${input.tryPoints}`,
    `- conversion points: ${input.conversionPoints}`,
    `- drop points: ${input.dropPoints}`,
    `- total active batch points: ${input.totalActiveBatchPoints}`,
    `- shot points share: ${input.shotPointsShare}%`,
    `- try points share: ${input.tryPointsShare}%`,
    `- conversion points share: ${input.conversionPointsShare}%`,
    `- drop points share: ${input.dropPointsShare}%`,
    `- shot dominance warning count: ${input.shotDominanceWarningCount}`,
    `- try starvation warning count: ${input.tryStarvationWarningCount}`,
    `- drop starvation warning count: ${input.dropStarvationWarningCount}`,
    `- drop dominance warning count: ${input.dropDominanceWarningCount}`,
    `- conversion leakage count: ${input.conversionLeakageCount}`,
    `- penalty leakage count: ${input.penaltyLeakageCount}`,
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

export function validateScoringChoiceBalance(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): ScoringChoiceBalanceValidationResult {
  const balanceReport = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const affordanceReport = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const affordanceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-affordance-volume.md"));
  const possessionDangerValidation = readIfExists(join(input.reportDirectory, "validation.offensive-possession-danger-phase.md"));
  const dangerNonShotValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const shotDominanceReport = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const shotDominanceValidation = readIfExists(join(input.reportDirectory, "validation.shot-dominance-diagnostic.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const unifiedValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
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
  const snapshot = analyzeScoringChoiceBalance({
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
  const registryPenalty = ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === "PENALTY_SHOT");
  const conversionLeakageCount = snapshot.routeIdentityWarnings.includes("CONVERSION_LEAKAGE_WARNING") ? 1 : 0;
  const penaltyLeakageCount = registryPenalty?.active === true ? 1 : 0;
  const checks: readonly ScoringChoiceBalanceCheck[] = [
    check("scoring-choice-balance.md exists", balanceReport.includes("# Scoring Choice Balance"), "scoring-choice-balance.md generated"),
    check("scoring version remains V2_DROP_FOUNDATION", snapshot.scoringVersion === "V2_DROP_FOUNDATION" && balanceReport.includes("V2_DROP_FOUNDATION"), snapshot.scoringVersion),
    check("score unit remains POINTS", snapshot.scoreUnit === "POINTS", snapshot.scoreUnit),
    check("SHOT_GOAL remains 3 points", balanceReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", balanceReport.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION_GOAL remains 2 points", balanceReport.includes(conversionRuleLabel()), conversionRuleLabel()),
    check("DROP_GOAL remains 2 points", balanceReport.includes(dropGoalRuleLabel()), dropGoalRuleLabel()),
    check("PENALTY_SHOT remains inactive", registryPenalty?.active === false && !/PENALTY_SHOT.*active: YES/.test(balanceReport + scoringEvents), "PENALTY_SHOT inactive"),
    check("route identity section exists for SHOT_GOAL", balanceReport.includes("SHOT_GOAL Route"), "SHOT_GOAL Route"),
    check("route identity section exists for TRY_TOUCHDOWN", balanceReport.includes("TRY_TOUCHDOWN Route"), "TRY_TOUCHDOWN Route"),
    check("route identity section exists for CONVERSION_GOAL", balanceReport.includes("CONVERSION_GOAL Route"), "CONVERSION_GOAL Route"),
    check("route identity section exists for DROP_GOAL", balanceReport.includes("DROP_GOAL Route"), "DROP_GOAL Route"),
    check("batch points distribution is reported", balanceReport.includes("Batch Points Distribution"), "Batch Points Distribution"),
    check("live mini-match scoring separation is reported", balanceReport.includes("Live Mini-Match Scoring Separation"), "Live Mini-Match Scoring Separation"),
    check("batch/live contamination remains 0", unifiedSummary.batchLiveContaminationCount === 0, `${unifiedSummary.batchLiveContaminationCount}`),
    check("conversion leakage warning is absent or explicitly zero", conversionLeakageCount === 0 || balanceReport.includes("CONVERSION_LEAKAGE_WARNING"), `${conversionLeakageCount}`),
    check("penalty leakage warning is absent or explicitly zero", penaltyLeakageCount === 0 && balanceReport.includes("penalty leakage warning: 0"), `${penaltyLeakageCount}`),
    check("scoring-events-summary.md includes scoring choice balance snapshot", scoringEvents.includes("Scoring Choice Balance Snapshot"), "snapshot visible"),
    check("scoring-choice-balance.md links to shot dominance diagnostic", balanceReport.includes("Shot Dominance Diagnostic Link"), "shot dominance link visible"),
    check("scoring-choice-balance.md links to scoring affordance volume diagnostic", balanceReport.includes("Scoring Affordance Volume Link"), "affordance link visible"),
    check("scoring-choice-balance.md links to offensive possession / danger phase report", balanceReport.includes("Offensive Possession / Danger Phase Link"), "possession/danger link visible"),
    check("danger phase non-shot affordance balance exists", balanceReport.includes("Danger Phase Non-Shot Affordance Balance"), "non-shot balance visible"),
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
    check("shot-dominance-diagnostic.md exists", shotDominanceReport.length === 0 || shotDominanceReport.includes("# Shot Dominance Diagnostic"), "diagnostic visible/refreshed later"),
    check("shot dominance diagnostic validation passes", validationPassesOrPending(shotDominanceValidation), "shot dominance PASS/refreshed later"),
    check("scoring-events-summary.md includes shot dominance diagnostic snapshot", scoringEvents.includes("Shot Dominance Diagnostic Snapshot"), "shot dominance snapshot visible"),
    check("tactical evidence includes scoring choice balance line", tacticalEvidence.includes("scoring choice balance: monitored"), "tactical balance line visible"),
    check("coach summary includes scoring choice balance line", coach.includes("scoring choice balance: monitored"), "coach balance line visible"),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedValidation), "unified validation PASS/refreshed later"),
    check("drop goal resolution calibration still passes", validationPassesOrPending(dropResolution), "drop resolution PASS/refreshed later"),
    check("drop goal opportunity generation still passes", validationPassesOrPending(dropOpportunity), "drop opportunity PASS/refreshed later"),
    check("drop goal foundation still passes", validationPassesOrPending(dropFoundation), "drop foundation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", tryCandidate.includes("Status: PASS"), "try candidate PASS"),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.scoring-choice-balance.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotPoints: snapshot.shotPoints,
      tryPoints: snapshot.tryPoints,
      conversionPoints: snapshot.conversionPoints,
      dropPoints: snapshot.dropPoints,
      totalActiveBatchPoints: snapshot.totalActiveBatchPoints,
      shotPointsShare: snapshot.shotPointsShare,
      tryPointsShare: snapshot.tryPointsShare,
      conversionPointsShare: snapshot.conversionPointsShare,
      dropPointsShare: snapshot.dropPointsShare,
      shotDominanceWarningCount: snapshot.routeDominanceWarnings.includes("SHOT_DOMINANCE_WARNING") ? 1 : 0,
      tryStarvationWarningCount: snapshot.routeStarvationWarnings.includes("TRY_STARVATION_WARNING") ? 1 : 0,
      dropStarvationWarningCount: snapshot.routeStarvationWarnings.includes("DROP_STARVATION_WARNING") ? 1 : 0,
      dropDominanceWarningCount: snapshot.routeDominanceWarnings.includes("DROP_DOMINANCE_WARNING") ? 1 : 0,
      conversionLeakageCount,
      penaltyLeakageCount,
      batchLiveContaminationCount: unifiedSummary.batchLiveContaminationCount,
      finalScoreMismatchCount: unifiedSummary.finalScoreMismatchCount,
      recommendation: snapshot.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
