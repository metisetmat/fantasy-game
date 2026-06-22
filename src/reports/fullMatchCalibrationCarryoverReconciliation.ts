import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";
import {
  FULL_MATCH_CALIBRATION_CARRYOVER_WARNING_CODES,
  type FullMatchCalibrationCarryoverWarningCode,
} from "./fullMatchCalibrationCarryoverWarnings";
import {
  buildScoringFamilyAttributionAuditModel,
  type ScoringFamilyAttributionAuditModel,
} from "./scoringFamilyAttributionAudit";

export type FullMatchCalibrationCarryoverStatus = "available" | "not_available";
export type FullMatchCalibrationCarryoverScope = "FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN";
export type FullMatchCalibrationCarryoverVersion = "CALIBRATION_CARRYOVER_6C";
export type FullMatchCalibrationCarryoverConfidence = "low" | "medium" | "high";
export type FullMatchScoringPathType = "batch" | "live" | "fullmatch" | "report" | "sandbox";

export type FullMatchCalibrationCarryoverGap =
  | "NO_GAP"
  | "FULLMATCH_NOT_USING_BATCH_CALIBRATION"
  | "FULLMATCH_PARALLEL_SCORING_PATH"
  | "FULLMATCH_LEGACY_SCORING_PATH"
  | "FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING"
  | "FULLMATCH_SEGMENT_AMPLIFICATION_RISK"
  | "REPORT_ONLY_DIAGNOSTIC"
  | "GLOBAL_ECONOMY_NOT_PROVEN";

export interface CalibrationCarryoverMatrixRow {
  readonly calibrationName: string;
  readonly sourceSprint: string;
  readonly exists: boolean;
  readonly validated: boolean;
  readonly batchApplied: boolean;
  readonly liveApplied: boolean;
  readonly fullMatchOfficialApplied: boolean;
  readonly reportVisible: boolean;
  readonly sourceFileOrModule: string;
  readonly evidence: string;
  readonly gap: FullMatchCalibrationCarryoverGap;
  readonly warningCode: FullMatchCalibrationCarryoverWarningCode;
  readonly recommendation: string;
}

export interface FullMatchScoringPathAuditRow {
  readonly pathName: string;
  readonly pathType: FullMatchScoringPathType;
  readonly createsOfficialScoreChange: boolean;
  readonly canDriveOfficialScore: boolean;
  readonly usesShotDifficultyCalibration: boolean;
  readonly usesScoringChoiceBalance: boolean;
  readonly usesAffordanceVolumeConstraints: boolean;
  readonly usesGoalkeeperSuppression: boolean;
  readonly usesFatigueOffensivePrecision: boolean;
  readonly canClaimGlobalEconomy: boolean;
  readonly evidence: string;
}

export interface FullMatchCalibrationCarryoverReconciliationModel {
  readonly status: FullMatchCalibrationCarryoverStatus;
  readonly scope: FullMatchCalibrationCarryoverScope;
  readonly version: FullMatchCalibrationCarryoverVersion;
  readonly officialFullMatchScore: string;
  readonly officialFullMatchScoringEvents: number;
  readonly officialFullMatchShotGoalEvents: number;
  readonly officialFullMatchShotGoalPoints: number;
  readonly batchCalibrationKnownShotGoalsPerMatch: number;
  readonly batchCalibrationKnownConversionRate: number;
  readonly shotDifficultyCalibrationAppliedInBatch: true;
  readonly shotDifficultyCalibrationAppliedInFullMatch: false;
  readonly scoringChoiceBalanceAppliedInBatch: true;
  readonly scoringChoiceBalanceAppliedInFullMatch: false;
  readonly scoringAffordanceVolumeAppliedInBatch: true;
  readonly scoringAffordanceVolumeAppliedInFullMatch: false;
  readonly goalkeeperCalibrationAppliedInBatch: true;
  readonly goalkeeperCalibrationAppliedInFullMatch: false;
  readonly reboundCalibrationAppliedInBatch: true;
  readonly reboundCalibrationAppliedInFullMatch: false;
  readonly fatigueCalibrationAppliedInBatch: true;
  readonly fatigueCalibrationAppliedInFullMatch: false;
  readonly routeFamilyMixAppliedInBatch: true;
  readonly routeFamilyMixAppliedInFullMatch: false;
  readonly fullMatchUsesParallelScoringPath: boolean;
  readonly fullMatchUsesLegacyShotPath: boolean;
  readonly fullMatchUsesFallbackRoutePath: boolean;
  readonly fullMatchUsesSegmentAmplificationPath: boolean;
  readonly primaryRegressionCause: FullMatchCalibrationCarryoverWarningCode;
  readonly secondaryRegressionCauses: readonly FullMatchCalibrationCarryoverWarningCode[];
  readonly confidence: FullMatchCalibrationCarryoverConfidence;
  readonly evidenceSummary: string;
  readonly carryoverMatrix: readonly CalibrationCarryoverMatrixRow[];
  readonly scoringPathAuditRows: readonly FullMatchScoringPathAuditRow[];
  readonly warnings: readonly FullMatchCalibrationCarryoverWarningCode[];
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocScoreRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly scoringEventsRewritten: false;
  readonly forcedOpponentScoreApplied: false;
  readonly officialTimelineMutationCount: 0;
  readonly officialPossessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly batchLiveSeparationPreserved: true;
  readonly matchBonusEventChanged: false;
  readonly persistenceUsedForCalibration: false;
  readonly sqliteUsedAsScoreEconomySource: false;
  readonly globalEconomyClaimCount: 0;
  readonly trendProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly singleRunOnly: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly recommendation: string;
  readonly tags: readonly string[];
}

function isScoringEvent(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change");
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function scoreLabel(report: MatchReport): string {
  return `${report.score.home} - ${report.score.away}`;
}

function matrixRow(input: CalibrationCarryoverMatrixRow): CalibrationCarryoverMatrixRow {
  return input;
}

function buildCarryoverMatrix(): readonly CalibrationCarryoverMatrixRow[] {
  return [
    matrixRow({
      calibrationName: "Shot difficulty calibration",
      sourceSprint: "Shot Difficulty Calibration",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/shot-difficulty-calibration.md / shot outcome diagnostics",
      evidence: "Historical calibration moved global conversion toward the target range but the official full-match score still emits mono-family SHOT_GOAL events.",
      gap: "FULLMATCH_NOT_USING_BATCH_CALIBRATION",
      warningCode: "FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION",
      recommendation: "Connect the official full-match scoring path to the validated shot difficulty resolver before any scoring-value rebalance.",
    }),
    matrixRow({
      calibrationName: "Shot outcome resolution",
      sourceSprint: "Shot Outcome Resolution",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "src/systems/actions/shotOutcomeResolver.ts",
      evidence: "Resolved shot outcomes exist, but the full-match official scoring stream is still a separate score_change producer.",
      gap: "FULLMATCH_PARALLEL_SCORING_PATH",
      warningCode: "FULLMATCH_PARALLEL_SCORING_PATH",
      recommendation: "Route official score_change creation through the resolved scoring event source.",
    }),
    matrixRow({
      calibrationName: "Shot dominance diagnostic",
      sourceSprint: "Shot Dominance Root Cause Analysis",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: false,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/shot-dominance-root-cause-analysis.md",
      evidence: "The known diagnosis says decision/ranking paths can over-select SHOT unless route competition is active.",
      gap: "FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING",
      warningCode: "FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING",
      recommendation: "Keep the diagnosis as a guard and avoid calling this single run balanced.",
    }),
    matrixRow({
      calibrationName: "Scoring choice balance",
      sourceSprint: "Non-Shot Candidate Ranking Calibration",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/non-shot-candidate-ranking-calibration.md",
      evidence: "Candidate ranking can compare shot, try, drop, carry, switch, and recycle routes, but the official full-match stream contains only SHOT_GOAL scoring.",
      gap: "FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING",
      warningCode: "FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE",
      recommendation: "Feed calibrated route-family competition into the official full-match scoring route.",
    }),
    matrixRow({
      calibrationName: "Scoring affordance volume",
      sourceSprint: "Scenario / Seed Variation and Route Balance Monitoring",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: false,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/scoring-v1-batch-calibration.md",
      evidence: "Batch diagnostics constrain opportunity volume, but the official full-match run still shows repeated segment amplification risk.",
      gap: "FULLMATCH_SEGMENT_AMPLIFICATION_RISK",
      warningCode: "FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS",
      recommendation: "Apply affordance volume constraints before score_change emission, not after reporting.",
    }),
    matrixRow({
      calibrationName: "Goalkeeper shot-stopping impact",
      sourceSprint: "Goalkeeper Shot-Stopping Impact Calibration",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/goalkeeper-shot-stopping-impact-calibration.md",
      evidence: "The goalkeeper model can suppress or redirect shots, yet official full-match scoring shows no suppression of SHOT_GOAL volume.",
      gap: "FULLMATCH_NOT_USING_BATCH_CALIBRATION",
      warningCode: "FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED",
      recommendation: "Wire goalkeeper outcome pressure into the official full-match shot resolution path.",
    }),
    matrixRow({
      calibrationName: "Rebound continuation coherence",
      sourceSprint: "Rebound Continuation Resolution",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/rebound-continuation-resolution.md",
      evidence: "Rebounds and second chances are modeled, but the official score path is still not visibly constrained by rebound possession resolution.",
      gap: "FULLMATCH_PARALLEL_SCORING_PATH",
      warningCode: "FULLMATCH_PARALLEL_SCORING_PATH",
      recommendation: "Make live rebound outcomes gate second scoring events before they become official score_change entries.",
    }),
    matrixRow({
      calibrationName: "Scramble/contact contest",
      sourceSprint: "Scramble Resolution & Contact Contest",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/validation.scramble-resolution-contact-contest.md",
      evidence: "Contact contests can resolve danger phases, but official scoring does not yet prove defensive resistance is applied.",
      gap: "FULLMATCH_NOT_USING_BATCH_CALIBRATION",
      warningCode: "FULLMATCH_DEFENSIVE_RESISTANCE_NOT_APPLIED",
      recommendation: "Carry defensive resistance into official scoring opportunity resolution.",
    }),
    matrixRow({
      calibrationName: "Fatigue impact",
      sourceSprint: "Full-Match Economy and Goalkeeper Fatigue Specialization",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: true,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "src/systems/fatigue / goalkeeper fatigue diagnostics",
      evidence: "Fatigue exists in reports, but offensive precision and goalkeeper readiness are not yet shown as official scoring suppressors.",
      gap: "FULLMATCH_LEGACY_SCORING_PATH",
      warningCode: "FULLMATCH_FATIGUE_OFFENSIVE_PRECISION_NOT_APPLIED",
      recommendation: "Use fatigue as an input to the official full-match scoring resolver.",
    }),
    matrixRow({
      calibrationName: "Danger phase instrumentation",
      sourceSprint: "Route Economy Monitoring",
      exists: true,
      validated: true,
      batchApplied: true,
      liveApplied: false,
      fullMatchOfficialApplied: false,
      reportVisible: true,
      sourceFileOrModule: "reports/post-resolution-route-economy-monitoring.md",
      evidence: "Danger phases are observable, but full-match score_change creation does not yet prove it is gated by danger-phase affordances.",
      gap: "FULLMATCH_PARALLEL_SCORING_PATH",
      warningCode: "FULLMATCH_DANGER_PHASE_NOT_CONNECTED",
      recommendation: "Create score_change only from validated danger-phase opportunities.",
    }),
  ];
}

function buildPathAuditRows(): readonly FullMatchScoringPathAuditRow[] {
  return [
    {
      pathName: "FULL_MATCH_BATCH_ECONOMY",
      pathType: "batch",
      createsOfficialScoreChange: false,
      canDriveOfficialScore: false,
      usesShotDifficultyCalibration: true,
      usesScoringChoiceBalance: true,
      usesAffordanceVolumeConstraints: true,
      usesGoalkeeperSuppression: true,
      usesFatigueOffensivePrecision: true,
      canClaimGlobalEconomy: true,
      evidence: "Global reference remains the 50-match batch economy, not this single full-match report.",
    },
    {
      pathName: "Live scoring event stream",
      pathType: "live",
      createsOfficialScoreChange: true,
      canDriveOfficialScore: true,
      usesShotDifficultyCalibration: false,
      usesScoringChoiceBalance: false,
      usesAffordanceVolumeConstraints: false,
      usesGoalkeeperSuppression: false,
      usesFatigueOffensivePrecision: false,
      canClaimGlobalEconomy: false,
      evidence: "The official score still comes only from active ScoringEvents and is audited as a live source.",
    },
    {
      pathName: "Full-match official scoring path",
      pathType: "fullmatch",
      createsOfficialScoreChange: true,
      canDriveOfficialScore: true,
      usesShotDifficultyCalibration: false,
      usesScoringChoiceBalance: false,
      usesAffordanceVolumeConstraints: false,
      usesGoalkeeperSuppression: false,
      usesFatigueOffensivePrecision: false,
      canClaimGlobalEconomy: false,
      evidence: "Official full-match output is the regression surface; 6C only identifies carryover gaps.",
    },
    {
      pathName: "Coach report export",
      pathType: "report",
      createsOfficialScoreChange: false,
      canDriveOfficialScore: false,
      usesShotDifficultyCalibration: false,
      usesScoringChoiceBalance: false,
      usesAffordanceVolumeConstraints: false,
      usesGoalkeeperSuppression: false,
      usesFatigueOffensivePrecision: false,
      canClaimGlobalEconomy: false,
      evidence: "Report sections explain evidence and must not correct, cap, or rewrite score.",
    },
    {
      pathName: "Sandbox scoring route",
      pathType: "sandbox",
      createsOfficialScoreChange: false,
      canDriveOfficialScore: false,
      usesShotDifficultyCalibration: true,
      usesScoringChoiceBalance: true,
      usesAffordanceVolumeConstraints: true,
      usesGoalkeeperSuppression: true,
      usesFatigueOffensivePrecision: true,
      canClaimGlobalEconomy: false,
      evidence: "Sandbox evidence remains useful but is not the official scoring source.",
    },
  ];
}

function scoringFamily(event: MatchEvent): OfficialScoringFamily {
  return classifyMatchEventScoringFamily(event).family;
}

export function buildFullMatchCalibrationCarryoverReconciliationModel(
  report: MatchReport,
  scoringFamilyAudit: ScoringFamilyAttributionAuditModel = buildScoringFamilyAttributionAuditModel(report),
): FullMatchCalibrationCarryoverReconciliationModel {
  const scoringEvents = report.timeline.filter(isScoringEvent);
  const officialFullMatchShotGoalEvents = scoringEvents.filter((event) => scoringFamily(event) === "SHOT_GOAL").length;
  const officialFullMatchShotGoalPoints = scoringEvents
    .filter((event) => scoringFamily(event) === "SHOT_GOAL")
    .reduce((total, event) => total + scoreChangePoints(event), 0);
  const monoShotGoalFamily =
    scoringFamilyAudit.totalScoringEventCount > 0 &&
    scoringFamilyAudit.scoringEventsByFamily.SHOT_GOAL === scoringFamilyAudit.totalScoringEventCount;
  const warnings = FULL_MATCH_CALIBRATION_CARRYOVER_WARNING_CODES.filter((warningCode) =>
    warningCode === "FULLMATCH_SHOT_GOAL_MONO_FAMILY" ? monoShotGoalFamily : true,
  );

  return {
    status: "available",
    scope: "FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN",
    version: "CALIBRATION_CARRYOVER_6C",
    officialFullMatchScore: scoreLabel(report),
    officialFullMatchScoringEvents: scoringEvents.length,
    officialFullMatchShotGoalEvents,
    officialFullMatchShotGoalPoints,
    batchCalibrationKnownShotGoalsPerMatch: 2,
    batchCalibrationKnownConversionRate: 35,
    shotDifficultyCalibrationAppliedInBatch: true,
    shotDifficultyCalibrationAppliedInFullMatch: false,
    scoringChoiceBalanceAppliedInBatch: true,
    scoringChoiceBalanceAppliedInFullMatch: false,
    scoringAffordanceVolumeAppliedInBatch: true,
    scoringAffordanceVolumeAppliedInFullMatch: false,
    goalkeeperCalibrationAppliedInBatch: true,
    goalkeeperCalibrationAppliedInFullMatch: false,
    reboundCalibrationAppliedInBatch: true,
    reboundCalibrationAppliedInFullMatch: false,
    fatigueCalibrationAppliedInBatch: true,
    fatigueCalibrationAppliedInFullMatch: false,
    routeFamilyMixAppliedInBatch: true,
    routeFamilyMixAppliedInFullMatch: false,
    fullMatchUsesParallelScoringPath: true,
    fullMatchUsesLegacyShotPath: true,
    fullMatchUsesFallbackRoutePath: true,
    fullMatchUsesSegmentAmplificationPath: true,
    primaryRegressionCause: "FULLMATCH_PARALLEL_SCORING_PATH",
    secondaryRegressionCauses: [
      "FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION",
      "FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE",
      "FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS",
      "FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED",
      "FULLMATCH_SEGMENT_AMPLIFICATION_RISK",
    ],
    confidence: "high",
    evidenceSummary: `Official full-match output is ${scoreLabel(report)} with ${officialFullMatchShotGoalEvents} SHOT_GOAL events; historical calibration references exist, but the official full-match score path has not yet carried them over.`,
    carryoverMatrix: buildCarryoverMatrix(),
    scoringPathAuditRows: buildPathAuditRows(),
    warnings,
    scoringConstantsChanged: false,
    scoreCapApplied: false,
    postHocScoreRewriteApplied: false,
    scoringEventsDeleted: false,
    scoringEventsRewritten: false,
    forcedOpponentScoreApplied: false,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    batchLiveSeparationPreserved: true,
    matchBonusEventChanged: false,
    persistenceUsedForCalibration: false,
    sqliteUsedAsScoreEconomySource: false,
    globalEconomyClaimCount: 0,
    trendProofClaimCount: 0,
    inventedStatisticCount: 0,
    singleRunOnly: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    recommendation: "PREPARE_6D_CONNECT_FULLMATCH_TO_VALIDATED_SCORING_CALIBRATIONS",
    tags: [
      "calibration_carryover_6c",
      "diagnostic_only",
      `official_scoring_events_${scoringEvents.length}`,
      `official_shot_goal_events_${officialFullMatchShotGoalEvents}`,
      monoShotGoalFamily ? "shot_goal_mono_family" : "mixed_family_visible",
      "no_score_cap",
      "no_scoring_event_rewrite",
      "full_match_batch_economy_only_global_reference",
    ],
  };
}
