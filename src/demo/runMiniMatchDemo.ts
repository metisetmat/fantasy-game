import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrototypeTeamId, PROTOTYPE_TEAMS, type PrototypeTeamDefinition } from "../data/prototypeTeams";
import { formatMiniMatchMarkdownReport } from "../reports/markdownMiniMatchReport";
import {
  formatCoachSummaryReport,
  formatDebugFullReport,
  formatTacticalEvidenceReport,
} from "../reports/reportHierarchy";
import { writeSharePack } from "../reports/sharePack";
import { createIntentIntegrationAuditMarkdown } from "../reports/intentIntegrationAudit";
import {
  validateActionSelectionCalibration,
  validateActionIntentSemanticContract,
  validateBallStateZoneContract,
  validateBatchScoringCalibration,
  validateCandidateExecutedActionConsistency,
  validateCandidateTieBreakingDecisionExplainability,
  validateCoachReportHierarchy,
  validateCoachSummaryDataBinding,
  validateCleanWindowStyleBalance,
  validateCleanShotSuccessCalibration,
  validateConversionDifficultyCalibration,
  validateConversionSubsystem,
  validateConversionGeometryStorage,
  validateConversionResolution,
  validateContinuationPayoffCalibration,
  validateDecisionNarrativeUnification,
  validateDangerPhaseConversionEconomy,
  validateDangerPhaseNonShotAffordanceGeneration,
  validateNonShotResolutionRebalance,
  validateDropGoalFoundation,
  validateDropGoalOpportunityGeneration,
  validateDropGoalResolutionCalibration,
  validateDropSubsystem,
  validateDrawRateStyleOutcomeMonitoring,
  validateFullMatchEconomyValidation,
  validateGKOutcomeDiversityRebound,
  validateGKShotStoppingGoalArea,
  validateGoalkeeperShotStoppingImpactCalibration,
  validateIntentReport,
  validateLiveTryEventIntegration,
  validateMatchEconomyMonitoring,
  validateMatchDurationPossessionVolumeCalibration,
  validateMultiActionSemanticGeneralization,
  validatePostResolutionConsistency,
  validatePostResolutionRouteEconomyMonitoring,
  validateNonShotCandidateRankingCalibration,
  validateReceiverAvailabilityCleanup,
  validateReceptionChainCalibration,
  validateReceptionQualityCalibration,
  validateReboundDangerCalibration,
  validateReboundThreatBalancing,
  validateReboundContinuationResolution,
  validateReportTruth,
  validateRouteBalancePostRankingMonitoring,
  validateRouteDecisionAndBalance,
  validateRouteEconomyMonitoring,
  validateRouteResolutionCalibrations,
  validateRouteSuccessRateCalibration,
  validateRugbyStyleLateralInGoalAccess,
  validateSnapshotTruth,
  validateSharePack,
  validateShotActionSemantics,
  validateShotSubsystem,
  validateShotDifficultyCalibration,
  validateShotOutcomeResolution,
  validateShotToReboundContinuationCoherence,
  validateShotDominanceRootCauseAnalysis,
  validateUnifiedLiveScoringEventStream,
  validateSelectionScoreConsistency,
  validateScoreUnitSemantics,
  validateTryTouchdownScoringFoundation,
  validateTryOpportunityGeneration,
  validateTryAttemptResolutionCalibration,
  validateTryCandidateExecutedIntegration,
  validateTryGroundingPressureCalibration,
  validateTrySubsystem,
  validateTryReportTerminologyCleanup,
  validateScrambleResolutionContactContest,
  validateScoringAffordanceVolume,
  validateScoringChoiceBalance,
  validateOffensivePossessionDangerPhase,
  validateScoringRulesV1Report,
  validateScoringV1GameplayCalibration,
  validateSemanticReasonConsistency,
  validateScenarioSeedVariation,
  validateTargetSemanticsGeneralization,
  validateTeamShapeIntentGeneralization,
  validateTacticalEvidenceCompaction,
  validateTacticalEvidenceMissingData,
  validateTacticalReportSemantics,
  validateValidationContractCleanup,
  validateWorldStateVisualAlignment,
  validateShotDominanceDiagnostic,
} from "../reports/validation";
import { writeTacticalSnapshots } from "../reports/visualization";
import { writeTacticalStoryboards } from "../reports/storyboard";
import { writeSequenceOneActionOneWorkbench } from "../reports/workbench";
import { createTeamShapeIntentGeneralizationReport } from "../reports/shape/teamShapeIntentGeneralizationReport";
import { runMiniMatch } from "../simulation/miniMatch";
import {
  createDropGoalFoundationReport,
  resolveShotOutcomes,
  summarizeDropGoalFoundation,
  summarizeTryOpportunityGeneration,
  validateShotOutcomes,
  type TryOpportunityRecord,
} from "../systems/actions";
import {
  analyzeOffensivePossessionDangerPhases,
  createOffensivePossessionDangerPhaseReport,
} from "../systems/phases";
import {
  createBatchScoringCalibrationReport,
  createCleanWindowStyleBalanceReport,
  createConversionGeometryStorageReport,
  createConversionResolutionReport,
  createDrawRateStyleOutcomeMonitoringReport,
  createLiveTryEventIntegrationReport,
  createNonShotResolutionRebalanceReport,
  createNonShotCandidateRankingCalibrationReport,
  createCandidateTieBreakingDecisionExplainabilityReport,
  createRouteBalancePostRankingMonitoringReport,
  summarizeRouteBalancePostRankingMonitoring,
  createRouteDecisionAndBalanceReport,
  createRouteSuccessRateCalibrationReport,
  summarizeRouteSuccessRateCalibration,
  createGoalkeeperShotStoppingImpactCalibrationReport,
  summarizeGoalkeeperShotStoppingImpactCalibration,
  createTryGroundingPressureCalibrationReport,
  summarizeTryGroundingPressureCalibration,
  createCleanShotSuccessCalibrationReport,
  summarizeCleanShotSuccessCalibration,
  createPostResolutionRouteEconomyMonitoringReport,
  summarizePostResolutionRouteEconomyMonitoring,
  createDangerPhaseConversionEconomyReport,
  summarizeDangerPhaseConversionEconomy,
  createContinuationPayoffCalibrationReport,
  summarizeContinuationPayoffCalibration,
  createRouteEconomyMonitoringReport,
  createMatchDurationPossessionVolumeCalibrationReport,
  summarizeMatchDurationPossessionVolumeCalibration,
  createCoachRoleGuideReport,
  createRoleFitModelReport,
  createRoleFitTestFixturesReport,
  createFullMatchEconomyValidationReport,
  summarizeFullMatchEconomyValidation,
  writeShotOriginHeatmapArtifacts,
  createRouteResolutionCalibrationsReport,
  createReboundDangerCalibrationReport,
  createScoringEventsSummaryReport,
  createScoringFromShotOutcomesReport,
  createScoringChoiceBalanceReport,
  createShotDominanceDiagnosticReport,
  createShotDominanceRootCauseAnalysisReport,
  createScoringAffordanceVolumeReport,
  createScoringV1GameplayCalibrationReport,
  createShotDifficultyCalibrationReport,
  createTryTouchdownBatchDiagnosticsReport,
  createTryTouchdownScoringFoundationReport,
  resolveBatchScoringCalibration,
  analyzeScoringChoiceBalance,
  analyzeShotDominance,
  analyzeScoringAffordanceVolume,
  summarizeConversionResolution,
  summarizeNonShotResolutionRebalance,
  type BatchScoringCalibrationSummary,
} from "../systems/scoring";
import {
  recordMiniMatchDebugTimeline,
  serializeDebugTimeline,
  validateDebugTimelineReplay,
} from "../systems/debugTimeline";

export * from "../core/ids";
export * from "../core/ratings";
export * from "../core/goalFrame";
export * from "../core/scoringZones";
export * from "../core/zones";
export * from "../data/prototypeTeams";
export * from "../data/teams";
export * from "../models/match";
export * from "../models/player";
export * from "../models/scoring";
export * from "../models/tactics";
export * from "../models/team";
export * from "../reports/markdownMiniMatchReport";
export * from "../reports/types";
export * from "../reports/storyboard";
export * from "../reports/validation";
export * from "../reports/visualization";
export * from "../reports/workbench";
export * from "../simulation/engine";
export * from "../simulation/miniMatch";
export * from "../systems/chaos";
export * from "../systems/ai";
export * from "../systems/actions";
export * from "../systems/ball";
export * from "../systems/debugTimeline";
export * from "../systems/decision";
export * from "../systems/events";
export * from "../systems/matchLoop";
export * from "../systems/offense";
export * from "../systems/players";
export * from "../systems/positioning";
export * from "../systems/principles";
export * from "../systems/rules";
export * from "../systems/roleFit";
export * from "../systems/scoring";
export * from "../systems/simulation";
export * from "../systems/structure";
export * from "../systems/tacticalMemory";
export * from "../systems/teams";
export * from "../systems/interactions/types";
export * from "../systems/intent";
export * from "../systems/interactions/buildUp";
export * from "../systems/interactions/construction";
export * from "../systems/interactions/finishing";
export * from "../systems/interactions/pressing";
export * from "../systems/interactions/shared";
export * from "../systems/interactions/transition";
export * from "../systems/sequences";
export * from "../systems/spatial";
export * from "../systems/tactics";
export * from "../systems/targets";

function getPrototypeTeam(id: PrototypeTeamId): PrototypeTeamDefinition {
  const team = PROTOTYPE_TEAMS.find((prototypeTeam) => prototypeTeam.id === id);
  if (team === undefined) {
    throw new Error(`Missing prototype team: ${id}`);
  }

  return team;
}

function summarizeTryOpportunityGenerationForIndex(
  batchCalibration: BatchScoringCalibrationSummary,
): readonly TryOpportunityRecord[] {
  return summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration.matchesSimulated,
    samples: batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  }).opportunities;
}

function runMiniMatchDemo(): void {
  const control = getPrototypeTeam(PrototypeTeamId.Control);
  const blitz = getPrototypeTeam(PrototypeTeamId.Blitz);
  const result = runMiniMatch({
    teamA: control,
    teamB: blitz,
    numberOfSequences: 6,
  });
  const reportDirectory = join(process.cwd(), "reports");
  const reportPath = join(reportDirectory, "latest-mini-match.md");
  const debugReportPath = join(reportDirectory, "latest-debug-mini-match.md");
  const coachSummaryPath = join(reportDirectory, "coach-summary.latest.md");
  const tacticalEvidencePath = join(reportDirectory, "tactical-evidence.latest.md");
  const debugFullPath = join(reportDirectory, "debug-full.latest.md");
  const dropGoalFoundationPath = join(reportDirectory, "drop-goal-foundation.md");
  const scoringEventsSummaryPath = join(reportDirectory, "scoring-events-summary.md");
  const scoringChoiceBalancePath = join(reportDirectory, "scoring-choice-balance.md");
  const shotDominanceDiagnosticPath = join(reportDirectory, "shot-dominance-diagnostic.md");
  const shotDominanceRootCauseAnalysisPath = join(reportDirectory, "shot-dominance-root-cause-analysis.md");
  const nonShotCandidateRankingCalibrationPath = join(reportDirectory, "non-shot-candidate-ranking-calibration.md");
  const candidateTieBreakingDecisionExplainabilityPath = join(reportDirectory, "candidate-tie-breaking-decision-explainability.md");
  const routeBalancePostRankingMonitoringPath = join(reportDirectory, "route-balance-post-ranking-monitoring.md");
  const routeDecisionAndBalancePath = join(reportDirectory, "route-decision-and-balance.md");
  const routeSuccessRateCalibrationPath = join(reportDirectory, "route-success-rate-calibration.md");
  const goalkeeperShotStoppingImpactCalibrationPath = join(reportDirectory, "goalkeeper-shot-stopping-impact-calibration.md");
  const tryGroundingPressureCalibrationPath = join(reportDirectory, "try-grounding-pressure-calibration.md");
  const cleanShotSuccessCalibrationPath = join(reportDirectory, "clean-shot-success-calibration.md");
  const postResolutionRouteEconomyMonitoringPath = join(reportDirectory, "post-resolution-route-economy-monitoring.md");
  const dangerPhaseConversionEconomyPath = join(reportDirectory, "danger-phase-conversion-economy.md");
  const continuationPayoffCalibrationPath = join(reportDirectory, "continuation-payoff-calibration.md");
  const routeEconomyMonitoringPath = join(reportDirectory, "route-economy-monitoring.md");
  const matchDurationPossessionVolumeCalibrationPath = join(reportDirectory, "match-duration-possession-volume-calibration.md");
  const fullMatchEconomyValidationPath = join(reportDirectory, "full-match-economy-validation.md");
  const coachRoleGuidePath = join(reportDirectory, "coach-role-guide.md");
  const roleFitModelPath = join(reportDirectory, "role-fit-model.md");
  const roleFitTestFixturesPath = join(reportDirectory, "role-fit-test-fixtures.md");
  const routeResolutionCalibrationsPath = join(reportDirectory, "route-resolution-calibrations.md");
  const scoringAffordanceVolumePath = join(reportDirectory, "scoring-affordance-volume.md");
  const offensivePossessionDangerPhasePath = join(reportDirectory, "offensive-possession-danger-phase.md");
  const scoringFromShotOutcomesPath = join(reportDirectory, "scoring-from-shot-outcomes.md");
  const scoringV1GameplayCalibrationPath = join(reportDirectory, "scoring-v1-gameplay-calibration.md");
  const scoringV1BatchCalibrationPath = join(reportDirectory, "scoring-v1-batch-calibration.md");
  const shotDifficultyCalibrationPath = join(reportDirectory, "shot-difficulty-calibration.md");
  const cleanWindowStyleBalancePath = join(reportDirectory, "clean-window-style-balance.md");
  const drawRateStyleOutcomeMonitoringPath = join(reportDirectory, "draw-rate-style-outcome-monitoring.md");
  const reboundDangerCalibrationPath = join(reportDirectory, "rebound-danger-calibration.md");
  const tryTouchdownFoundationPath = join(reportDirectory, "try-touchdown-scoring-foundation.md");
  const tryTouchdownBatchDiagnosticsPath = join(reportDirectory, "try-touchdown-batch-diagnostics.md");
  const conversionGeometryStoragePath = join(reportDirectory, "conversion-geometry-storage.md");
  const conversionResolutionPath = join(reportDirectory, "conversion-resolution.md");
  const liveTryEventIntegrationPath = join(reportDirectory, "live-try-event-integration.md");
  const nonShotResolutionRebalancePath = join(reportDirectory, "non-shot-resolution-rebalance.md");
  const teamShapeIntentGeneralizationPath = join(reportDirectory, "team-shape-intent-generalization.md");
  const debugTimelinePath = join(reportDirectory, "latest-debug-timeline.json");
  const intentAuditPath = join(reportDirectory, "intent-integration-audit.md");
  const displayPath = "reports/latest-mini-match.md";
  const debugTimelineDisplayPath = "reports/latest-debug-timeline.json";

  if (!existsSync(reportDirectory)) {
    mkdirSync(reportDirectory);
  }

  for (const generatedPath of [reportPath, debugReportPath, debugTimelinePath]) {
    if (existsSync(generatedPath)) {
      unlinkSync(generatedPath);
    }
  }

  const snapshots = writeTacticalSnapshots({ result, reportDirectory });
  const storyboards = writeTacticalStoryboards({ snapshots, reportDirectory });
  const failedStoryboards = storyboards.filter((storyboard) => storyboard.validationStatus === "FAIL");

  if (failedStoryboards.length > 0) {
    throw new Error(
      `Storyboard validation failed: ${failedStoryboards
        .map((storyboard) => `${storyboard.pagePath}: ${storyboard.warnings.join("; ")}`)
        .join(" | ")}`,
    );
  }
  const worldStateVisualAlignment = validateWorldStateVisualAlignment({
    snapshots,
    reportDirectory,
  });

  if (!worldStateVisualAlignment.valid) {
    throw new Error(`World-state visual alignment failed: ${worldStateVisualAlignment.reportPath}`);
  }
  writeSequenceOneActionOneWorkbench({
    snapshots,
    reportDirectory,
  });
  const debugTimeline = recordMiniMatchDebugTimeline({ result });
  const debugTimelineValidation = validateDebugTimelineReplay(debugTimeline);

  if (!debugTimelineValidation.valid) {
    throw new Error(`Invalid debug timeline: ${debugTimelineValidation.errors.join("; ")}`);
  }

  const ballStateZoneContract = validateBallStateZoneContract({
    snapshots,
    timeline: debugTimeline,
    reportDirectory,
  });

  if (!ballStateZoneContract.valid) {
    throw new Error(`Ball state zone contract failed: ${ballStateZoneContract.reportPath}`);
  }

  const shotOutcomes = resolveShotOutcomes({ result, snapshots });
  const shotOutcomeValidation = validateShotOutcomes({ result, outcomes: shotOutcomes });

  if (!shotOutcomeValidation.valid) {
    throw new Error(`Shot outcome contract failed: ${shotOutcomeValidation.errors.join("; ")}`);
  }
  const batchScoringCalibration = resolveBatchScoringCalibration({
    reportDirectory,
    teamA: control,
    teamB: blitz,
  });
  const tryOpportunitiesForScoring = summarizeTryOpportunityGenerationForIndex(batchScoringCalibration);
  const conversionResolutionForScoring = summarizeConversionResolution({
    result,
    opportunities: tryOpportunitiesForScoring,
  });
  const dropGoalFoundationSummary = summarizeDropGoalFoundation({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const scoringChoiceBalanceSummary = analyzeScoringChoiceBalance({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const shotDominanceDiagnosticSummary = analyzeShotDominance({
    result,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });
  const scoringAffordanceVolumeSummary = analyzeScoringAffordanceVolume({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const offensivePossessionDangerPhaseSummary = analyzeOffensivePossessionDangerPhases({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const nonShotResolutionRebalanceSummary = summarizeNonShotResolutionRebalance({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const routeBalancePostRankingMonitoringSummary = summarizeRouteBalancePostRankingMonitoring({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const routeSuccessRateCalibrationSummary = summarizeRouteSuccessRateCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const goalkeeperShotStoppingImpactCalibrationSummary = summarizeGoalkeeperShotStoppingImpactCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const tryGroundingPressureCalibrationSummary = summarizeTryGroundingPressureCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const cleanShotSuccessCalibrationSummary = summarizeCleanShotSuccessCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const postResolutionRouteEconomyMonitoringSummary = summarizePostResolutionRouteEconomyMonitoring({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const dangerPhaseConversionEconomySummary = summarizeDangerPhaseConversionEconomy({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const continuationPayoffCalibrationSummary = summarizeContinuationPayoffCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const matchDurationPossessionVolumeCalibrationSummary = summarizeMatchDurationPossessionVolumeCalibration({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const fullMatchEconomyValidationSummary = summarizeFullMatchEconomyValidation({
    result,
    batchCalibration: batchScoringCalibration,
  });
  writeShotOriginHeatmapArtifacts({
    batchCalibration: batchScoringCalibration,
    reportDirectory,
  });

  const tacticalEvidenceBaseMarkdown = formatMiniMatchMarkdownReport(
    result,
    snapshots,
    debugTimelineDisplayPath,
    "reports/storyboards/index.md",
    storyboards,
    "COACH_REPORT",
  );
  const reportMarkdown = formatTacticalEvidenceReport({
    result,
    snapshots,
    markdown: tacticalEvidenceBaseMarkdown,
    shotOutcomes,
    batchCalibration: batchScoringCalibration,
  });
  const validationReportMarkdown = tacticalEvidenceBaseMarkdown;
  const debugReportBaseMarkdown = formatMiniMatchMarkdownReport(
    result,
    snapshots,
    debugTimelineDisplayPath,
    "reports/storyboards/index.md",
    storyboards,
    "DEBUG_FULL_REPORT",
  );
  const debugReportMarkdown = formatDebugFullReport({
    result,
    markdown: debugReportBaseMarkdown,
  });
  const coachSummaryMarkdown = formatCoachSummaryReport({
    result,
    snapshots,
    tacticalEvidenceMarkdown: validationReportMarkdown,
    shotOutcomes,
    batchCalibration: batchScoringCalibration,
  });
  const scoringFromShotOutcomesMarkdown = createScoringFromShotOutcomesReport({
    result,
    snapshots,
    outcomes: shotOutcomes,
    batchCalibration: batchScoringCalibration,
  });
  const scoringEventsSummaryMarkdown = createScoringEventsSummaryReport({
    result,
    shotOutcomes,
    liveConversionAttempts: conversionResolutionForScoring.liveAttempts,
    liveDropGoalAttempts: dropGoalFoundationSummary.liveAttempts,
    batchTryAttempts: tryOpportunitiesForScoring.filter((opportunity) => opportunity.attemptGenerated).length,
    batchTriesScored: tryOpportunitiesForScoring.filter((opportunity) => opportunity.outcome === "TRY_SCORED").length,
    batchConversionAttempts: conversionResolutionForScoring.batchConversionAttempts,
    batchConversionsMade: conversionResolutionForScoring.batchConversionsMade,
    batchConversionPoints: conversionResolutionForScoring.batchConversionPoints,
    batchDropOpportunities: dropGoalFoundationSummary.batchDropOpportunities,
    batchDropCandidatesGenerated: dropGoalFoundationSummary.batchDropCandidatesGenerated,
    batchDropAttempts: dropGoalFoundationSummary.batchDropAttempts,
    batchDropGoals: dropGoalFoundationSummary.batchDropGoals,
    batchDropMissed: dropGoalFoundationSummary.batchDropMissed,
    batchDropBlocked: dropGoalFoundationSummary.batchDropBlocked,
    batchDropInvalid: dropGoalFoundationSummary.batchDropInvalid,
    batchDropSuccessRate: dropGoalFoundationSummary.batchDropSuccessRate,
    batchDropPoints: dropGoalFoundationSummary.batchDropPoints,
    scoringChoiceBalance: scoringChoiceBalanceSummary,
    shotDominanceDiagnostic: shotDominanceDiagnosticSummary,
    scoringAffordanceVolume: scoringAffordanceVolumeSummary,
    possessionDangerPhase: offensivePossessionDangerPhaseSummary,
    nonShotResolutionRebalance: nonShotResolutionRebalanceSummary,
    routeBalancePostRankingMonitoring: routeBalancePostRankingMonitoringSummary,
    routeSuccessRateCalibration: routeSuccessRateCalibrationSummary,
    goalkeeperShotStoppingImpactCalibration: goalkeeperShotStoppingImpactCalibrationSummary,
    tryGroundingPressureCalibration: tryGroundingPressureCalibrationSummary,
    cleanShotSuccessCalibration: cleanShotSuccessCalibrationSummary,
    postResolutionRouteEconomyMonitoring: postResolutionRouteEconomyMonitoringSummary,
    dangerPhaseConversionEconomy: dangerPhaseConversionEconomySummary,
    continuationPayoffCalibration: continuationPayoffCalibrationSummary,
    matchDurationPossessionVolumeCalibration: matchDurationPossessionVolumeCalibrationSummary,
    fullMatchEconomyValidation: fullMatchEconomyValidationSummary,
  });
  const dropGoalFoundationMarkdown = createDropGoalFoundationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const scoringChoiceBalanceMarkdown = createScoringChoiceBalanceReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const shotDominanceDiagnosticMarkdown = createShotDominanceDiagnosticReport({
    result,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });
  const shotDominanceRootCauseAnalysisMarkdown = createShotDominanceRootCauseAnalysisReport({
    result,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
    teamShapeValidationMarkdown: "",
  });
  const nonShotCandidateRankingCalibrationMarkdown = createNonShotCandidateRankingCalibrationReport(batchScoringCalibration);
  const candidateTieBreakingDecisionExplainabilityMarkdown = createCandidateTieBreakingDecisionExplainabilityReport(batchScoringCalibration);
  const routeBalancePostRankingMonitoringMarkdown = createRouteBalancePostRankingMonitoringReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const routeDecisionAndBalanceMarkdown = createRouteDecisionAndBalanceReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const routeSuccessRateCalibrationMarkdown = createRouteSuccessRateCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const goalkeeperShotStoppingImpactCalibrationMarkdown = createGoalkeeperShotStoppingImpactCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const tryGroundingPressureCalibrationMarkdown = createTryGroundingPressureCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const cleanShotSuccessCalibrationMarkdown = createCleanShotSuccessCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const postResolutionRouteEconomyMonitoringMarkdown = createPostResolutionRouteEconomyMonitoringReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const dangerPhaseConversionEconomyMarkdown = createDangerPhaseConversionEconomyReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const continuationPayoffCalibrationMarkdown = createContinuationPayoffCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const routeEconomyMonitoringMarkdown = createRouteEconomyMonitoringReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const matchDurationPossessionVolumeCalibrationMarkdown = createMatchDurationPossessionVolumeCalibrationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const fullMatchEconomyValidationMarkdown = createFullMatchEconomyValidationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const coachRoleGuideMarkdown = createCoachRoleGuideReport();
  const roleFitModelMarkdown = createRoleFitModelReport();
  const roleFitTestFixturesMarkdown = createRoleFitTestFixturesReport();
  const routeResolutionCalibrationsMarkdown = createRouteResolutionCalibrationsReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const scoringAffordanceVolumeMarkdown = createScoringAffordanceVolumeReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const offensivePossessionDangerPhaseMarkdown = createOffensivePossessionDangerPhaseReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const scoringV1GameplayCalibrationMarkdown = createScoringV1GameplayCalibrationReport({
    result,
    outcomes: shotOutcomes,
    batchCalibration: batchScoringCalibration,
  });
  const scoringV1BatchCalibrationMarkdown = createBatchScoringCalibrationReport(batchScoringCalibration);
  const shotDifficultyCalibrationMarkdown = createShotDifficultyCalibrationReport(batchScoringCalibration);
  const cleanWindowStyleBalanceMarkdown = createCleanWindowStyleBalanceReport(batchScoringCalibration);
  const drawRateStyleOutcomeMonitoringMarkdown = createDrawRateStyleOutcomeMonitoringReport(batchScoringCalibration);
  const reboundDangerCalibrationMarkdown = createReboundDangerCalibrationReport(batchScoringCalibration);
  const tryTouchdownFoundationMarkdown = createTryTouchdownScoringFoundationReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const tryTouchdownBatchDiagnosticsMarkdown = createTryTouchdownBatchDiagnosticsReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const conversionGeometryStorageMarkdown = createConversionGeometryStorageReport({
    opportunities: tryOpportunitiesForScoring,
  });
  const conversionResolutionMarkdown = createConversionResolutionReport({
    result,
    opportunities: tryOpportunitiesForScoring,
    shotPoints: result.summary.finalScore.teamA + result.summary.finalScore.teamB,
    tryPoints: result.summary.liveTryEvents.reduce((sum, event) => sum + event.pointValue, 0),
  });
  const liveTryEventIntegrationMarkdown = createLiveTryEventIntegrationReport(result);
  const nonShotResolutionRebalanceMarkdown = createNonShotResolutionRebalanceReport({
    result,
    batchCalibration: batchScoringCalibration,
  });
  const teamShapeIntentGeneralizationMarkdown = createTeamShapeIntentGeneralizationReport({
    snapshots,
  });

  writeFileSync(reportPath, coachSummaryMarkdown, "utf8");
  writeFileSync(coachSummaryPath, coachSummaryMarkdown, "utf8");
  writeFileSync(tacticalEvidencePath, reportMarkdown, "utf8");
  writeFileSync(debugFullPath, debugReportMarkdown, "utf8");
  writeFileSync(debugReportPath, debugReportMarkdown, "utf8");
  writeFileSync(dropGoalFoundationPath, dropGoalFoundationMarkdown, "utf8");
  writeFileSync(scoringEventsSummaryPath, scoringEventsSummaryMarkdown, "utf8");
  writeFileSync(scoringChoiceBalancePath, scoringChoiceBalanceMarkdown, "utf8");
  writeFileSync(shotDominanceDiagnosticPath, shotDominanceDiagnosticMarkdown, "utf8");
  writeFileSync(shotDominanceRootCauseAnalysisPath, shotDominanceRootCauseAnalysisMarkdown, "utf8");
  writeFileSync(nonShotCandidateRankingCalibrationPath, nonShotCandidateRankingCalibrationMarkdown, "utf8");
  writeFileSync(candidateTieBreakingDecisionExplainabilityPath, candidateTieBreakingDecisionExplainabilityMarkdown, "utf8");
  writeFileSync(scoringAffordanceVolumePath, scoringAffordanceVolumeMarkdown, "utf8");
  writeFileSync(offensivePossessionDangerPhasePath, offensivePossessionDangerPhaseMarkdown, "utf8");
  writeFileSync(scoringFromShotOutcomesPath, scoringFromShotOutcomesMarkdown, "utf8");
  writeFileSync(scoringV1GameplayCalibrationPath, scoringV1GameplayCalibrationMarkdown, "utf8");
  writeFileSync(scoringV1BatchCalibrationPath, scoringV1BatchCalibrationMarkdown, "utf8");
  writeFileSync(shotDifficultyCalibrationPath, shotDifficultyCalibrationMarkdown, "utf8");
  writeFileSync(cleanWindowStyleBalancePath, cleanWindowStyleBalanceMarkdown, "utf8");
  writeFileSync(cleanShotSuccessCalibrationPath, cleanShotSuccessCalibrationMarkdown, "utf8");
  writeFileSync(postResolutionRouteEconomyMonitoringPath, postResolutionRouteEconomyMonitoringMarkdown, "utf8");
  writeFileSync(dangerPhaseConversionEconomyPath, dangerPhaseConversionEconomyMarkdown, "utf8");
  writeFileSync(continuationPayoffCalibrationPath, continuationPayoffCalibrationMarkdown, "utf8");
  writeFileSync(routeEconomyMonitoringPath, routeEconomyMonitoringMarkdown, "utf8");
  writeFileSync(matchDurationPossessionVolumeCalibrationPath, matchDurationPossessionVolumeCalibrationMarkdown, "utf8");
  writeFileSync(fullMatchEconomyValidationPath, fullMatchEconomyValidationMarkdown, "utf8");
  writeFileSync(routeResolutionCalibrationsPath, routeResolutionCalibrationsMarkdown, "utf8");
  writeFileSync(dangerPhaseConversionEconomyPath, dangerPhaseConversionEconomyMarkdown, "utf8");
  writeFileSync(drawRateStyleOutcomeMonitoringPath, drawRateStyleOutcomeMonitoringMarkdown, "utf8");
  writeFileSync(reboundDangerCalibrationPath, reboundDangerCalibrationMarkdown, "utf8");
  writeFileSync(tryTouchdownFoundationPath, tryTouchdownFoundationMarkdown, "utf8");
  writeFileSync(tryTouchdownBatchDiagnosticsPath, tryTouchdownBatchDiagnosticsMarkdown, "utf8");
  writeFileSync(conversionGeometryStoragePath, conversionGeometryStorageMarkdown, "utf8");
  writeFileSync(conversionResolutionPath, conversionResolutionMarkdown, "utf8");
  writeFileSync(liveTryEventIntegrationPath, liveTryEventIntegrationMarkdown, "utf8");
  writeFileSync(nonShotResolutionRebalancePath, nonShotResolutionRebalanceMarkdown, "utf8");
  writeFileSync(teamShapeIntentGeneralizationPath, teamShapeIntentGeneralizationMarkdown, "utf8");

  const reportTruthValidation = validateReportTruth({
    reportMarkdown: validationReportMarkdown,
    timeline: debugTimeline,
  });

  if (!reportTruthValidation.valid) {
    throw new Error(`Report truth validation failed: ${reportTruthValidation.errors.join("; ")}`);
  }
  const intentReportValidation = validateIntentReport({
    reportMarkdown: validationReportMarkdown,
    timeline: debugTimeline,
    snapshots,
    reportDirectory,
  });

  if (!intentReportValidation.valid) {
    throw new Error(`Intent report validation failed: ${intentReportValidation.errors.join("; ")}`);
  }
  const snapshotTruthValidation = validateSnapshotTruth({
    snapshots,
    reportDirectory,
  });

  if (!snapshotTruthValidation.valid) {
    throw new Error(`Snapshot truth validation failed: ${snapshotTruthValidation.errors.join("; ")}`);
  }
  const receiverAvailabilityCleanup = validateReceiverAvailabilityCleanup({
    reportMarkdown: validationReportMarkdown,
    snapshots,
    reportDirectory,
  });

  if (!receiverAvailabilityCleanup.valid) {
    throw new Error(`Receiver availability cleanup failed: ${receiverAvailabilityCleanup.reportPath}`);
  }
  const receptionChainCalibration = validateReceptionChainCalibration({
    reportMarkdown: validationReportMarkdown,
    snapshots,
    reportDirectory,
  });

  if (!receptionChainCalibration.valid) {
    throw new Error(`Reception chain calibration failed: ${receptionChainCalibration.reportPath}`);
  }
  const postResolutionConsistency = validatePostResolutionConsistency({
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!postResolutionConsistency.valid) {
    throw new Error(`Post-resolution consistency failed: ${postResolutionConsistency.reportPath}`);
  }
  const receptionQualityCalibration = validateReceptionQualityCalibration({
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!receptionQualityCalibration.valid) {
    throw new Error(`Reception quality calibration failed: ${receptionQualityCalibration.reportPath}`);
  }
  const tacticalReportSemantics = validateTacticalReportSemantics({
    reportMarkdown,
    debugReportMarkdown,
    reportDirectory,
  });

  if (!tacticalReportSemantics.valid) {
    throw new Error(`Tactical report semantics failed: ${tacticalReportSemantics.reportPath}`);
  }
  const actionSelectionCalibration = validateActionSelectionCalibration({
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!actionSelectionCalibration.valid) {
    throw new Error(`Action selection calibration failed: ${actionSelectionCalibration.reportPath}`);
  }
  const selectionScoreConsistency = validateSelectionScoreConsistency({
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!selectionScoreConsistency.valid) {
    throw new Error(`Selection score consistency failed: ${selectionScoreConsistency.reportPath}`);
  }
  const actionIntentSemanticContract = validateActionIntentSemanticContract({
    timeline: debugTimeline,
    reportDirectory,
  });

  if (!actionIntentSemanticContract.valid) {
    throw new Error(`Action / intent semantic contract failed: ${actionIntentSemanticContract.reportPath}`);
  }
  const multiActionSemanticGeneralization = validateMultiActionSemanticGeneralization({
    timeline: debugTimeline,
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!multiActionSemanticGeneralization.valid) {
    throw new Error(`Multi-action semantic generalization failed: ${multiActionSemanticGeneralization.reportPath}`);
  }
  const semanticReasonConsistency = validateSemanticReasonConsistency({
    timeline: debugTimeline,
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!semanticReasonConsistency.valid) {
    throw new Error(`Semantic reason consistency failed: ${semanticReasonConsistency.reportPath}`);
  }
  const targetSemanticsGeneralization = validateTargetSemanticsGeneralization({
    timeline: debugTimeline,
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
  });

  if (!targetSemanticsGeneralization.valid) {
    throw new Error(`Target semantics generalization failed: ${targetSemanticsGeneralization.reportPath}`);
  }
  const decisionNarrativeUnification = validateDecisionNarrativeUnification({
    reportMarkdown: validationReportMarkdown,
    debugReportMarkdown,
    reportDirectory,
  });

  if (!decisionNarrativeUnification.valid) {
    throw new Error(`Decision narrative unification failed: ${decisionNarrativeUnification.reportPath}`);
  }
  const candidateExecutedActionConsistency = validateCandidateExecutedActionConsistency({
    reportMarkdown: validationReportMarkdown,
    reportDirectory,
    shotOutcomes,
    liveTryEvents: result.summary.liveTryEvents,
  });

  if (!candidateExecutedActionConsistency.valid) {
    throw new Error(`Candidate-to-executed action consistency failed: ${candidateExecutedActionConsistency.reportPath}`);
  }
  const validationContractCleanup = validateValidationContractCleanup({
    reportDirectory,
  });

  if (!validationContractCleanup.valid) {
    throw new Error(`Validation contract cleanup failed: ${validationContractCleanup.reportPath}`);
  }
  const coachSummaryDataBinding = validateCoachSummaryDataBinding({
    reportDirectory,
  });

  if (!coachSummaryDataBinding.valid) {
    throw new Error(`Coach summary data binding failed: ${coachSummaryDataBinding.reportPath}`);
  }
  const tacticalEvidenceMissingData = validateTacticalEvidenceMissingData({
    reportDirectory,
  });

  if (!tacticalEvidenceMissingData.valid) {
    throw new Error(`Tactical evidence missing data failed: ${tacticalEvidenceMissingData.reportPath}`);
  }
  const shotActionSemantics = validateShotActionSemantics({
    reportDirectory,
  });

  if (!shotActionSemantics.valid) {
    throw new Error(`Shot action semantics failed: ${shotActionSemantics.reportPath}`);
  }
  let shotOutcomeResolution = validateShotOutcomeResolution({
    result,
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!shotOutcomeResolution.valid) {
    throw new Error(`Shot outcome resolution failed: ${shotOutcomeResolution.reportPath}`);
  }
  let scoreUnitSemantics = validateScoreUnitSemantics({
    result,
    shotOutcomes,
    reportDirectory,
  });

  if (!scoreUnitSemantics.valid) {
    throw new Error(`Score unit semantics failed: ${scoreUnitSemantics.reportPath}`);
  }
  let scoringRulesV1 = validateScoringRulesV1Report({
    reportDirectory,
    workspaceRoot: process.cwd(),
  });

  if (!scoringRulesV1.valid) {
    throw new Error(`Scoring rules V1 failed: ${scoringRulesV1.reportPath}`);
  }
  const scoringV1GameplayCalibration = validateScoringV1GameplayCalibration({
    result,
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!scoringV1GameplayCalibration.valid) {
    throw new Error(`Scoring V1 gameplay calibration failed: ${scoringV1GameplayCalibration.reportPath}`);
  }
  const scoringV1BatchCalibration = validateBatchScoringCalibration({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!scoringV1BatchCalibration.valid) {
    throw new Error(`Scoring V1 batch calibration failed: ${scoringV1BatchCalibration.reportPath}`);
  }
  const scenarioSeedVariation = validateScenarioSeedVariation({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!scenarioSeedVariation.valid) {
    throw new Error(`Scenario / seed variation failed: ${scenarioSeedVariation.reportPath}`);
  }
  const shotDifficultyCalibration = validateShotDifficultyCalibration({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!shotDifficultyCalibration.valid) {
    throw new Error(`Shot difficulty calibration failed: ${shotDifficultyCalibration.reportPath}`);
  }
  const cleanWindowStyleBalance = validateCleanWindowStyleBalance({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!cleanWindowStyleBalance.valid) {
    throw new Error(`Clean window / style balance failed: ${cleanWindowStyleBalance.reportPath}`);
  }
  const drawRateStyleOutcomeMonitoring = validateDrawRateStyleOutcomeMonitoring({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!drawRateStyleOutcomeMonitoring.valid) {
    throw new Error(`Draw rate / style outcome monitoring failed: ${drawRateStyleOutcomeMonitoring.reportPath}`);
  }
  const gkShotStoppingGoalArea = validateGKShotStoppingGoalArea({
    result,
    snapshots,
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!gkShotStoppingGoalArea.valid) {
    throw new Error(`GK shot-stopping / goal-area validation failed: ${gkShotStoppingGoalArea.reportPath}`);
  }
  const gkOutcomeDiversityRebound = validateGKOutcomeDiversityRebound({
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!gkOutcomeDiversityRebound.valid) {
    throw new Error(`GK outcome diversity / rebound validation failed: ${gkOutcomeDiversityRebound.reportPath}`);
  }
  const reboundContinuationResolution = validateReboundContinuationResolution({
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!reboundContinuationResolution.valid) {
    throw new Error(`Rebound continuation resolution failed: ${reboundContinuationResolution.reportPath}`);
  }
  const reboundDangerCalibration = validateReboundDangerCalibration({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!reboundDangerCalibration.valid) {
    throw new Error(`Rebound danger calibration failed: ${reboundDangerCalibration.reportPath}`);
  }
  const reboundThreatBalancing = validateReboundThreatBalancing({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!reboundThreatBalancing.valid) {
    throw new Error(`Rebound threat balancing failed: ${reboundThreatBalancing.reportPath}`);
  }
  const scrambleResolutionContactContest = validateScrambleResolutionContactContest({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!scrambleResolutionContactContest.valid) {
    throw new Error(`Scramble resolution / contact contest failed: ${scrambleResolutionContactContest.reportPath}`);
  }
  const shotToReboundContinuationCoherence = validateShotToReboundContinuationCoherence({
    reportDirectory,
    summary: batchScoringCalibration,
  });

  if (!shotToReboundContinuationCoherence.valid) {
    throw new Error(`Shot-to-rebound continuation coherence failed: ${shotToReboundContinuationCoherence.reportPath}`);
  }
  const tryTouchdownScoringFoundation = validateTryTouchdownScoringFoundation({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!tryTouchdownScoringFoundation.valid) {
    throw new Error(`Try / touchdown scoring foundation failed: ${tryTouchdownScoringFoundation.reportPath}`);
  }
  const rugbyStyleLateralInGoalAccess = validateRugbyStyleLateralInGoalAccess({
    result,
    reportDirectory,
  });

  if (!rugbyStyleLateralInGoalAccess.valid) {
    throw new Error(`Rugby-style lateral in-goal access failed: ${rugbyStyleLateralInGoalAccess.reportPath}`);
  }
  const tryOpportunityGeneration = validateTryOpportunityGeneration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!tryOpportunityGeneration.valid) {
    throw new Error(`Try opportunity generation failed: ${tryOpportunityGeneration.reportPath}`);
  }
  const tryAttemptResolutionCalibration = validateTryAttemptResolutionCalibration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!tryAttemptResolutionCalibration.valid) {
    throw new Error(`Try attempt resolution calibration failed: ${tryAttemptResolutionCalibration.reportPath}`);
  }
  const conversionGeometryStorage = validateConversionGeometryStorage({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!conversionGeometryStorage.valid) {
    throw new Error(`Conversion geometry storage failed: ${conversionGeometryStorage.reportPath}`);
  }
  const conversionResolution = validateConversionResolution({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!conversionResolution.valid) {
    throw new Error(`Conversion resolution failed: ${conversionResolution.reportPath}`);
  }
  const liveTryEventIntegration = validateLiveTryEventIntegration({
    result,
    reportDirectory,
  });

  if (!liveTryEventIntegration.valid) {
    throw new Error(`Live try event integration failed: ${liveTryEventIntegration.reportPath}`);
  }
  const tryCandidateExecutedIntegration = validateTryCandidateExecutedIntegration({
    result,
    reportDirectory,
  });

  if (!tryCandidateExecutedIntegration.valid) {
    throw new Error(`Try candidate/executed integration failed: ${tryCandidateExecutedIntegration.reportPath}`);
  }
  const tryReportTerminologyCleanup = validateTryReportTerminologyCleanup({
    reportDirectory,
  });

  if (!tryReportTerminologyCleanup.valid) {
    throw new Error(`Try report terminology cleanup failed: ${tryReportTerminologyCleanup.reportPath}`);
  }
  const conversionDifficultyCalibration = validateConversionDifficultyCalibration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!conversionDifficultyCalibration.valid) {
    throw new Error(`Conversion difficulty calibration failed: ${conversionDifficultyCalibration.reportPath}`);
  }
  const dropGoalFoundation = validateDropGoalFoundation({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!dropGoalFoundation.valid) {
    throw new Error(`Drop goal foundation failed: ${dropGoalFoundation.reportPath}`);
  }
  const dropGoalOpportunityGeneration = validateDropGoalOpportunityGeneration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!dropGoalOpportunityGeneration.valid) {
    throw new Error(`Drop goal opportunity generation failed: ${dropGoalOpportunityGeneration.reportPath}`);
  }
  const dropGoalResolutionCalibration = validateDropGoalResolutionCalibration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!dropGoalResolutionCalibration.valid) {
    throw new Error(`Drop goal resolution calibration failed: ${dropGoalResolutionCalibration.reportPath}`);
  }
  const unifiedLiveScoringEventStream = validateUnifiedLiveScoringEventStream({
    result,
    outcomes: shotOutcomes,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
  });

  if (!unifiedLiveScoringEventStream.valid) {
    throw new Error(`Unified live scoring event stream failed: ${unifiedLiveScoringEventStream.reportPath}`);
  }
  const shotDominanceDiagnostic = validateShotDominanceDiagnostic({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!shotDominanceDiagnostic.valid) {
    throw new Error(`Shot dominance diagnostic failed: ${shotDominanceDiagnostic.reportPath}`);
  }
  const scoringChoiceBalance = validateScoringChoiceBalance({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!scoringChoiceBalance.valid) {
    throw new Error(`Scoring choice balance failed: ${scoringChoiceBalance.reportPath}`);
  }
  const scoringAffordanceVolume = validateScoringAffordanceVolume({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!scoringAffordanceVolume.valid) {
    throw new Error(`Scoring affordance volume failed: ${scoringAffordanceVolume.reportPath}`);
  }
  const offensivePossessionDangerPhase = validateOffensivePossessionDangerPhase({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!offensivePossessionDangerPhase.valid) {
    throw new Error(`Offensive possession / danger phase failed: ${offensivePossessionDangerPhase.reportPath}`);
  }
  const dangerPhaseNonShotAffordanceGeneration = validateDangerPhaseNonShotAffordanceGeneration({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!dangerPhaseNonShotAffordanceGeneration.valid) {
    throw new Error(`Danger phase non-shot affordance generation failed: ${dangerPhaseNonShotAffordanceGeneration.reportPath}`);
  }
  const nonShotResolutionRebalance = validateNonShotResolutionRebalance({
    result,
    reportDirectory,
    batchCalibration: batchScoringCalibration,
    shotOutcomes,
  });

  if (!nonShotResolutionRebalance.valid) {
    throw new Error(`Non-shot resolution rebalance failed: ${nonShotResolutionRebalance.reportPath}`);
  }
  const refreshedGkOutcomeDiversityRebound = validateGKOutcomeDiversityRebound({
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!refreshedGkOutcomeDiversityRebound.valid) {
    throw new Error(`GK outcome diversity / rebound validation failed after continuation validation: ${refreshedGkOutcomeDiversityRebound.reportPath}`);
  }
  const refreshedShotActionSemantics = validateShotActionSemantics({
    reportDirectory,
  });

  if (!refreshedShotActionSemantics.valid) {
    throw new Error(`Shot action semantics failed after GK outcome validation: ${refreshedShotActionSemantics.reportPath}`);
  }
  shotOutcomeResolution = validateShotOutcomeResolution({
    result,
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!shotOutcomeResolution.valid) {
    throw new Error(`Shot outcome resolution failed after scoring rules validation: ${shotOutcomeResolution.reportPath}`);
  }
  scoreUnitSemantics = validateScoreUnitSemantics({
    result,
    shotOutcomes,
    reportDirectory,
  });

  if (!scoreUnitSemantics.valid) {
    throw new Error(`Score unit semantics failed after scoring rules validation: ${scoreUnitSemantics.reportPath}`);
  }
  scoringRulesV1 = validateScoringRulesV1Report({
    reportDirectory,
    workspaceRoot: process.cwd(),
  });

  if (!scoringRulesV1.valid) {
    throw new Error(`Scoring rules V1 failed after gameplay calibration validation: ${scoringRulesV1.reportPath}`);
  }
  const refreshedGameplayCalibration = validateScoringV1GameplayCalibration({
    result,
    outcomes: shotOutcomes,
    reportDirectory,
  });

  if (!refreshedGameplayCalibration.valid) {
    throw new Error(`Scoring V1 gameplay calibration failed after batch validation: ${refreshedGameplayCalibration.reportPath}`);
  }
  const teamShapeIntentGeneralization = validateTeamShapeIntentGeneralization({
    snapshots,
    reportDirectory,
  });

  if (!teamShapeIntentGeneralization.valid) {
    throw new Error(`Team shape intent generalization failed: ${teamShapeIntentGeneralization.reportPath}`);
  }
  writeFileSync(
    shotDominanceRootCauseAnalysisPath,
    createShotDominanceRootCauseAnalysisReport({
      result,
      batchCalibration: batchScoringCalibration,
      shotOutcomes,
      teamShapeValidationMarkdown: readFileSync(teamShapeIntentGeneralization.reportPath, "utf8"),
    }),
    "utf8",
  );
  const shotDominanceRootCauseAnalysis = validateShotDominanceRootCauseAnalysis({
    reportDirectory,
  });

  if (!shotDominanceRootCauseAnalysis.valid) {
    throw new Error(`Shot dominance root-cause analysis failed: ${shotDominanceRootCauseAnalysis.reportPath}`);
  }
  writeFileSync(nonShotCandidateRankingCalibrationPath, createNonShotCandidateRankingCalibrationReport(batchScoringCalibration), "utf8");
  const nonShotCandidateRankingCalibration = validateNonShotCandidateRankingCalibration({
    reportDirectory,
  });

  if (!nonShotCandidateRankingCalibration.valid) {
    throw new Error(`Non-shot candidate ranking calibration failed: ${nonShotCandidateRankingCalibration.reportPath}`);
  }
  writeFileSync(candidateTieBreakingDecisionExplainabilityPath, createCandidateTieBreakingDecisionExplainabilityReport(batchScoringCalibration), "utf8");
  const candidateTieBreakingDecisionExplainability = validateCandidateTieBreakingDecisionExplainability({
    reportDirectory,
  });

  if (!candidateTieBreakingDecisionExplainability.valid) {
    throw new Error(`Candidate tie-breaking and decision explainability failed: ${candidateTieBreakingDecisionExplainability.reportPath}`);
  }
  writeFileSync(
    routeBalancePostRankingMonitoringPath,
    createRouteBalancePostRankingMonitoringReport({
      result,
      batchCalibration: batchScoringCalibration,
    }),
    "utf8",
  );
  const routeBalancePostRankingMonitoring = validateRouteBalancePostRankingMonitoring({
    reportDirectory,
  });

  if (!routeBalancePostRankingMonitoring.valid) {
    throw new Error(`Route balance post-ranking monitoring failed: ${routeBalancePostRankingMonitoring.reportPath}`);
  }
  writeFileSync(
    routeSuccessRateCalibrationPath,
    createRouteSuccessRateCalibrationReport({
      result,
      batchCalibration: batchScoringCalibration,
    }),
    "utf8",
  );
  const routeSuccessRateCalibration = validateRouteSuccessRateCalibration({
    reportDirectory,
  });

  if (!routeSuccessRateCalibration.valid) {
    throw new Error(`Route success rate calibration failed: ${routeSuccessRateCalibration.reportPath}`);
  }
  writeFileSync(routeDecisionAndBalancePath, routeDecisionAndBalanceMarkdown, "utf8");
  const routeDecisionAndBalance = validateRouteDecisionAndBalance({
    reportDirectory,
  });

  if (!routeDecisionAndBalance.valid) {
    throw new Error(`Route decision and balance validation failed: ${routeDecisionAndBalance.reportPath}`);
  }
  writeFileSync(goalkeeperShotStoppingImpactCalibrationPath, goalkeeperShotStoppingImpactCalibrationMarkdown, "utf8");
  writeFileSync(scoringEventsSummaryPath, scoringEventsSummaryMarkdown, "utf8");
  writeFileSync(coachSummaryPath, coachSummaryMarkdown, "utf8");
  writeFileSync(reportPath, coachSummaryMarkdown, "utf8");
  writeFileSync(tacticalEvidencePath, reportMarkdown, "utf8");
  const goalkeeperShotStoppingImpactCalibration = validateGoalkeeperShotStoppingImpactCalibration({
    reportDirectory,
  });

  if (!goalkeeperShotStoppingImpactCalibration.valid) {
    throw new Error(`Goalkeeper shot-stopping impact calibration failed: ${goalkeeperShotStoppingImpactCalibration.reportPath}`);
  }
  writeFileSync(tryGroundingPressureCalibrationPath, tryGroundingPressureCalibrationMarkdown, "utf8");
  const tryGroundingPressureCalibration = validateTryGroundingPressureCalibration({
    reportDirectory,
  });

  if (!tryGroundingPressureCalibration.valid) {
    throw new Error(`Try grounding pressure calibration failed: ${tryGroundingPressureCalibration.reportPath}`);
  }
  writeFileSync(cleanShotSuccessCalibrationPath, cleanShotSuccessCalibrationMarkdown, "utf8");
  const cleanShotSuccessCalibration = validateCleanShotSuccessCalibration({
    reportDirectory,
  });

  if (!cleanShotSuccessCalibration.valid) {
    throw new Error(`Clean shot success calibration failed: ${cleanShotSuccessCalibration.reportPath}`);
  }
  writeFileSync(postResolutionRouteEconomyMonitoringPath, postResolutionRouteEconomyMonitoringMarkdown, "utf8");
  const postResolutionRouteEconomyMonitoring = validatePostResolutionRouteEconomyMonitoring({
    reportDirectory,
  });

  if (!postResolutionRouteEconomyMonitoring.valid) {
    throw new Error(`Post-resolution route economy monitoring failed: ${postResolutionRouteEconomyMonitoring.reportPath}`);
  }
  writeFileSync(dangerPhaseConversionEconomyPath, dangerPhaseConversionEconomyMarkdown, "utf8");
  const dangerPhaseConversionEconomy = validateDangerPhaseConversionEconomy({
    reportDirectory,
  });

  if (!dangerPhaseConversionEconomy.valid) {
    throw new Error(`Danger phase conversion economy failed: ${dangerPhaseConversionEconomy.reportPath}`);
  }
  writeFileSync(routeResolutionCalibrationsPath, routeResolutionCalibrationsMarkdown, "utf8");
  const routeResolutionCalibrations = validateRouteResolutionCalibrations({
    reportDirectory,
  });

  if (!routeResolutionCalibrations.valid) {
    throw new Error(`Route resolution calibrations validation failed: ${routeResolutionCalibrations.reportPath}`);
  }
  writeFileSync(continuationPayoffCalibrationPath, continuationPayoffCalibrationMarkdown, "utf8");
  const continuationPayoffCalibration = validateContinuationPayoffCalibration({
    reportDirectory,
  });

  if (!continuationPayoffCalibration.valid) {
    throw new Error(`Continuation payoff calibration failed: ${continuationPayoffCalibration.reportPath}`);
  }
  writeFileSync(routeEconomyMonitoringPath, routeEconomyMonitoringMarkdown, "utf8");
  const routeEconomyMonitoring = validateRouteEconomyMonitoring({
    reportDirectory,
  });

  if (!routeEconomyMonitoring.valid) {
    throw new Error(`Route economy monitoring validation failed: ${routeEconomyMonitoring.reportPath}`);
  }
  writeFileSync(matchDurationPossessionVolumeCalibrationPath, matchDurationPossessionVolumeCalibrationMarkdown, "utf8");
  const matchDurationPossessionVolumeCalibration = validateMatchDurationPossessionVolumeCalibration({
    reportDirectory,
  });

  if (!matchDurationPossessionVolumeCalibration.valid) {
    throw new Error(`Match duration possession volume calibration failed: ${matchDurationPossessionVolumeCalibration.reportPath}`);
  }
  const shotSubsystem = validateShotSubsystem({ reportDirectory });

  if (!shotSubsystem.valid) {
    throw new Error(`Shot subsystem aggregate validation failed: ${shotSubsystem.reportPath}`);
  }
  const trySubsystem = validateTrySubsystem({ reportDirectory });

  if (!trySubsystem.valid) {
    throw new Error(`Try subsystem aggregate validation failed: ${trySubsystem.reportPath}`);
  }
  const dropSubsystem = validateDropSubsystem({ reportDirectory });

  if (!dropSubsystem.valid) {
    throw new Error(`Drop subsystem aggregate validation failed: ${dropSubsystem.reportPath}`);
  }
  const conversionSubsystem = validateConversionSubsystem({ reportDirectory });

  if (!conversionSubsystem.valid) {
    throw new Error(`Conversion subsystem aggregate validation failed: ${conversionSubsystem.reportPath}`);
  }
  writeFileSync(fullMatchEconomyValidationPath, fullMatchEconomyValidationMarkdown, "utf8");
  writeFileSync(coachRoleGuidePath, coachRoleGuideMarkdown, "utf8");
  writeFileSync(roleFitModelPath, roleFitModelMarkdown, "utf8");
  writeFileSync(roleFitTestFixturesPath, roleFitTestFixturesMarkdown, "utf8");
  const fullMatchEconomyValidation = validateFullMatchEconomyValidation({
    reportDirectory,
  });

  if (!fullMatchEconomyValidation.valid) {
    throw new Error(`Full-match economy validation failed: ${fullMatchEconomyValidation.reportPath}`);
  }
  const matchEconomyMonitoring = validateMatchEconomyMonitoring({
    reportDirectory,
  });

  if (!matchEconomyMonitoring.valid) {
    throw new Error(`Match economy monitoring validation failed: ${matchEconomyMonitoring.reportPath}`);
  }
  const coachReportHierarchy = validateCoachReportHierarchy({
    reportDirectory,
  });

  if (!coachReportHierarchy.valid) {
    throw new Error(`Coach report hierarchy failed: ${coachReportHierarchy.reportPath}`);
  }
  const tacticalEvidenceCompaction = validateTacticalEvidenceCompaction({
    reportDirectory,
  });

  if (!tacticalEvidenceCompaction.valid) {
    throw new Error(`Tactical evidence compaction failed: ${tacticalEvidenceCompaction.reportPath}`);
  }
  writeSharePack({ reportDirectory });
  const sharePackValidation = validateSharePack({
    reportDirectory,
  });

  if (!sharePackValidation.valid) {
    throw new Error(`Share pack validation failed: ${sharePackValidation.reportPath}`);
  }

  writeFileSync(debugTimelinePath, serializeDebugTimeline(debugTimeline), "utf8");
  writeFileSync(reportPath, coachSummaryMarkdown, "utf8");
  writeFileSync(coachSummaryPath, coachSummaryMarkdown, "utf8");
  writeFileSync(tacticalEvidencePath, reportMarkdown, "utf8");
  writeFileSync(debugFullPath, debugReportMarkdown, "utf8");
  writeFileSync(debugReportPath, debugReportMarkdown, "utf8");
  writeFileSync(dropGoalFoundationPath, dropGoalFoundationMarkdown, "utf8");
  writeFileSync(scoringEventsSummaryPath, scoringEventsSummaryMarkdown, "utf8");
  writeFileSync(scoringChoiceBalancePath, scoringChoiceBalanceMarkdown, "utf8");
  writeFileSync(shotDominanceDiagnosticPath, shotDominanceDiagnosticMarkdown, "utf8");
  writeFileSync(nonShotCandidateRankingCalibrationPath, nonShotCandidateRankingCalibrationMarkdown, "utf8");
  writeFileSync(candidateTieBreakingDecisionExplainabilityPath, candidateTieBreakingDecisionExplainabilityMarkdown, "utf8");
  writeFileSync(routeBalancePostRankingMonitoringPath, routeBalancePostRankingMonitoringMarkdown, "utf8");
  writeFileSync(routeDecisionAndBalancePath, routeDecisionAndBalanceMarkdown, "utf8");
  writeFileSync(routeSuccessRateCalibrationPath, routeSuccessRateCalibrationMarkdown, "utf8");
  writeFileSync(goalkeeperShotStoppingImpactCalibrationPath, goalkeeperShotStoppingImpactCalibrationMarkdown, "utf8");
  writeFileSync(tryGroundingPressureCalibrationPath, tryGroundingPressureCalibrationMarkdown, "utf8");
  writeFileSync(cleanShotSuccessCalibrationPath, cleanShotSuccessCalibrationMarkdown, "utf8");
  writeFileSync(postResolutionRouteEconomyMonitoringPath, postResolutionRouteEconomyMonitoringMarkdown, "utf8");
  writeFileSync(dangerPhaseConversionEconomyPath, dangerPhaseConversionEconomyMarkdown, "utf8");
  writeFileSync(continuationPayoffCalibrationPath, continuationPayoffCalibrationMarkdown, "utf8");
  writeFileSync(routeEconomyMonitoringPath, routeEconomyMonitoringMarkdown, "utf8");
  writeFileSync(matchDurationPossessionVolumeCalibrationPath, matchDurationPossessionVolumeCalibrationMarkdown, "utf8");
  writeFileSync(fullMatchEconomyValidationPath, fullMatchEconomyValidationMarkdown, "utf8");
  writeFileSync(coachRoleGuidePath, coachRoleGuideMarkdown, "utf8");
  writeFileSync(roleFitModelPath, roleFitModelMarkdown, "utf8");
  writeFileSync(roleFitTestFixturesPath, roleFitTestFixturesMarkdown, "utf8");
  writeFileSync(routeResolutionCalibrationsPath, routeResolutionCalibrationsMarkdown, "utf8");
  writeFileSync(scoringAffordanceVolumePath, scoringAffordanceVolumeMarkdown, "utf8");
  writeFileSync(offensivePossessionDangerPhasePath, offensivePossessionDangerPhaseMarkdown, "utf8");
  writeFileSync(scoringFromShotOutcomesPath, scoringFromShotOutcomesMarkdown, "utf8");
  writeFileSync(scoringV1GameplayCalibrationPath, scoringV1GameplayCalibrationMarkdown, "utf8");
  writeFileSync(scoringV1BatchCalibrationPath, scoringV1BatchCalibrationMarkdown, "utf8");
  writeFileSync(shotDifficultyCalibrationPath, shotDifficultyCalibrationMarkdown, "utf8");
  writeFileSync(cleanWindowStyleBalancePath, cleanWindowStyleBalanceMarkdown, "utf8");
  writeFileSync(drawRateStyleOutcomeMonitoringPath, drawRateStyleOutcomeMonitoringMarkdown, "utf8");
  writeFileSync(reboundDangerCalibrationPath, reboundDangerCalibrationMarkdown, "utf8");
  writeFileSync(tryTouchdownFoundationPath, tryTouchdownFoundationMarkdown, "utf8");
  writeFileSync(tryTouchdownBatchDiagnosticsPath, tryTouchdownBatchDiagnosticsMarkdown, "utf8");
  writeFileSync(conversionGeometryStoragePath, conversionGeometryStorageMarkdown, "utf8");
  writeFileSync(conversionResolutionPath, conversionResolutionMarkdown, "utf8");
  writeFileSync(liveTryEventIntegrationPath, liveTryEventIntegrationMarkdown, "utf8");
  writeFileSync(nonShotResolutionRebalancePath, nonShotResolutionRebalanceMarkdown, "utf8");
  writeFileSync(teamShapeIntentGeneralizationPath, teamShapeIntentGeneralizationMarkdown, "utf8");
  writeFileSync(intentAuditPath, createIntentIntegrationAuditMarkdown(process.cwd()), "utf8");

  console.log(`MINI MATCH: ${control.displayName} vs ${blitz.displayName}`);
  console.log(`Final Score: ${control.displayName} ${result.summary.finalScore.teamA} - ${result.summary.finalScore.teamB} ${blitz.displayName}`);
  console.log(`Full report written to: ${displayPath}`);
  console.log("Coach summary written to: reports/coach-summary.latest.md");
  console.log("Tactical evidence written to: reports/tactical-evidence.latest.md");
  console.log("Debug full report written to: reports/debug-full.latest.md");
  console.log("Debug mini-match report written to: reports/latest-debug-mini-match.md");
  console.log("Drop goal foundation written to: reports/drop-goal-foundation.md");
  console.log("Drop goal opportunity generation written to: reports/validation.drop-goal-opportunity-generation.md");
  console.log("Drop goal resolution calibration written to: reports/validation.drop-goal-resolution-calibration.md");
  console.log("Scoring events summary written to: reports/scoring-events-summary.md");
  console.log("Scoring choice balance written to: reports/scoring-choice-balance.md");
  console.log("Shot dominance diagnostic written to: reports/shot-dominance-diagnostic.md");
  console.log("Shot dominance root-cause analysis written to: reports/shot-dominance-root-cause-analysis.md");
  console.log("Non-shot candidate ranking calibration written to: reports/non-shot-candidate-ranking-calibration.md");
  console.log("Candidate tie-breaking and decision explainability written to: reports/candidate-tie-breaking-decision-explainability.md");
  console.log("Route balance post-ranking monitoring written to: reports/route-balance-post-ranking-monitoring.md");
  console.log("Route decision and balance written to: reports/route-decision-and-balance.md");
  console.log("Route success rate calibration written to: reports/route-success-rate-calibration.md");
  console.log("Goalkeeper shot-stopping impact calibration written to: reports/goalkeeper-shot-stopping-impact-calibration.md");
  console.log("Try grounding pressure calibration written to: reports/try-grounding-pressure-calibration.md");
  console.log("Clean shot success calibration written to: reports/clean-shot-success-calibration.md");
  console.log("Post-resolution route economy monitoring written to: reports/post-resolution-route-economy-monitoring.md");
  console.log("Danger phase conversion economy written to: reports/danger-phase-conversion-economy.md");
  console.log("Continuation payoff calibration written to: reports/continuation-payoff-calibration.md");
  console.log("Route economy monitoring written to: reports/route-economy-monitoring.md");
  console.log("Match duration & possession volume calibration written to: reports/match-duration-possession-volume-calibration.md");
  console.log("Full-match economy validation written to: reports/full-match-economy-validation.md");
  console.log("Coach role guide written to: reports/coach-role-guide.md");
  console.log("Role fit model written to: reports/role-fit-model.md");
  console.log("Role fit test fixtures written to: reports/role-fit-test-fixtures.md");
  console.log("Route resolution calibrations written to: reports/route-resolution-calibrations.md");
  console.log("Scoring affordance volume written to: reports/scoring-affordance-volume.md");
  console.log("Offensive possession / danger phase written to: reports/offensive-possession-danger-phase.md");
  console.log("Scoring choice balance validation written to: reports/validation.scoring-choice-balance.md");
  console.log("Shot dominance diagnostic validation written to: reports/validation.shot-dominance-diagnostic.md");
  console.log("Scoring affordance volume validation written to: reports/validation.scoring-affordance-volume.md");
  console.log("Offensive possession / danger phase validation written to: reports/validation.offensive-possession-danger-phase.md");
  console.log("Danger phase non-shot affordance generation validation written to: reports/validation.danger-phase-non-shot-affordance-generation.md");
  console.log("Non-shot resolution rebalance written to: reports/non-shot-resolution-rebalance.md");
  console.log("Non-shot resolution rebalance validation written to: reports/validation.non-shot-resolution-rebalance.md");
  console.log(`Debug timeline written to: ${debugTimelineDisplayPath}`);
  console.log("Tactical storyboards written to: reports/storyboards/index.md");
  console.log("Sequence 1 Action 1 workbench written to: reports/workbench/sequence-1-action-1.html");
  console.log("Receiver availability cleanup written to: reports/receiver-availability-cleanup.md");
  console.log("Reception chain calibration written to: reports/reception-chain-calibration.md");
  console.log("Post-resolution consistency written to: reports/post-resolution-consistency.md");
  console.log("Reception quality calibration written to: reports/reception-quality-calibration.md");
  console.log("Tactical report semantics cleanup written to: reports/tactical-report-semantics-cleanup.md");
  console.log("Action selection calibration written to: reports/action-selection-calibration.md");
  console.log("Selection score consistency written to: reports/selection-score-consistency.md");
  console.log("Action / intent semantic contract written to: reports/action-intent-semantic-contract.md");
  console.log("Multi-action semantic generalization written to: reports/multi-action-semantic-generalization.md");
  console.log("Semantic reason consistency written to: reports/semantic-reason-consistency.md");
  console.log("Target semantics generalization written to: reports/target-semantics-generalization.md");
  console.log("Decision narrative unification written to: reports/decision-narrative-unification.md");
  console.log("Candidate-to-executed action consistency written to: reports/candidate-executed-action-consistency.md");
  console.log("Validation contract cleanup written to: reports/validation-contract-cleanup.md");
  console.log("Coach summary data binding written to: reports/validation.coach-summary-data-binding.md");
  console.log("Tactical evidence missing data written to: reports/validation.tactical-evidence-missing-data.md");
  console.log("Shot action semantics written to: reports/validation.shot-action-semantics.md");
  console.log("Shot outcome resolution written to: reports/validation.shot-outcome-resolution.md");
  console.log("Score unit semantics written to: reports/validation.score-unit-semantics.md");
  console.log("Scoring rules V1 written to: reports/validation.scoring-rules-v1.md");
  console.log("Coach report reading hierarchy written to: reports/validation.coach-report-hierarchy.md");
  console.log("Tactical evidence compaction written to: reports/validation.tactical-evidence-compaction.md");
  console.log("Share pack validation written to: reports/validation.share-pack.md");
  console.log("Scoring from shot outcomes written to: reports/scoring-from-shot-outcomes.md");
  console.log("Scoring V1 gameplay calibration written to: reports/scoring-v1-gameplay-calibration.md");
  console.log("Scoring V1 batch calibration written to: reports/scoring-v1-batch-calibration.md");
  console.log("Scenario / seed variation written to: reports/scenario-seed-variation.md");
  console.log("Shot difficulty calibration written to: reports/shot-difficulty-calibration.md");
  console.log("Clean window & style balance written to: reports/clean-window-style-balance.md");
  console.log("Draw rate & style outcome monitoring written to: reports/draw-rate-style-outcome-monitoring.md");
  console.log("GK shot-stopping & goal-area validation written to: reports/validation.gk-shot-stopping-goal-area.md");
  console.log("GK outcome diversity & rebound validation written to: reports/validation.gk-outcome-diversity-rebound.md");
  console.log("Rebound continuation resolution written to: reports/validation.rebound-continuation-resolution.md");
  console.log("Rebound danger calibration written to: reports/validation.rebound-danger-calibration.md");
  console.log("Rebound threat balancing written to: reports/validation.rebound-threat-balancing.md");
  console.log("Scramble resolution & contact contest written to: reports/validation.scramble-resolution-contact-contest.md");
  console.log("Shot-to-rebound continuation coherence written to: reports/validation.shot-to-rebound-continuation-coherence.md");
  console.log("Try / touchdown scoring foundation written to: reports/validation.try-touchdown-scoring-foundation.md");
  console.log("Rugby-style lateral in-goal access written to: reports/validation.rugby-style-lateral-in-goal-access.md");
  console.log("Try opportunity generation written to: reports/validation.try-opportunity-generation.md");
  console.log("Try attempt resolution calibration written to: reports/validation.try-attempt-resolution-calibration.md");
  console.log("Conversion geometry storage written to: reports/validation.conversion-geometry-storage.md");
  console.log("Conversion resolution written to: reports/validation.conversion-resolution.md");
  console.log("Conversion difficulty calibration written to: reports/validation.conversion-difficulty-calibration.md");
  console.log("Live try event integration written to: reports/validation.live-try-event-integration.md");
  console.log("Try candidate/executed integration written to: reports/validation.try-candidate-executed-integration.md");
  console.log("Try report terminology cleanup written to: reports/validation.try-report-terminology-cleanup.md");
  console.log("Team shape intent generalization written to: reports/team-shape-intent-generalization.md");
  console.log("Team shape intent generalization validation written to: reports/validation.team-shape-intent-generalization.md");
  console.log("Ball state zone contract written to: reports/ball-state-zone-contract.md");
  console.log("World-state visual alignment written to: reports/world-state-visual-alignment.md");
  console.log("Intent integration audit written to: reports/intent-integration-audit.md");
}

runMiniMatchDemo();
