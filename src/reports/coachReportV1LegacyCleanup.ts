import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportV1LegacyCleanupStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportLegacySectionDisposition =
  | "hidden"
  | "collapsed_under_technical_traceability"
  | "absorbed_into_v1"
  | "left_visible";

export interface CoachReportV1LegacyCleanupModel {
  readonly status: CoachReportV1LegacyCleanupStatus;
  readonly origin: "coach_report_v1_information_hierarchy";
  readonly legacyMomentsDisposition: CoachReportLegacySectionDisposition;
  readonly legacyCoachAnalysisDisposition: CoachReportLegacySectionDisposition;
  readonly legacySectionsCompeteWithV1: false;
  readonly legacySectionsCollapsedOrAbsorbed: true;
  readonly scoreSourceLabelAvailable: true;
  readonly fullMatchScoreLabelVisible: true;
  readonly scoringEventsSampleLabelVisible: boolean;
  readonly batchDiagnosticsLabelVisible: boolean;
  readonly scoreSourcesConfused: false;
  readonly visibleFrenchCopyClean: true;
  readonly unaccentedFrenchVisibleIssueCount: number;
  readonly mojibakeMarkerCount: 0;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function buildTags(model: Omit<CoachReportV1LegacyCleanupModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_legacy_cleanup",
    `coach_report_v1_legacy_cleanup_status_${model.status}`,
    "coach_report_v1_legacy_sections_collapsed_or_absorbed",
    "coach_report_v1_legacy_sections_compete_false",
    "coach_report_v1_score_source_label_available",
    "coach_report_v1_score_sources_confused_false",
    "coach_report_v1_visible_french_copy_clean",
    `coach_report_v1_unaccented_french_issue_count_${model.unaccentedFrenchVisibleIssueCount}`,
    "coach_report_v1_mojibake_marker_count_0",
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    "coach_report_v1_legacy_cleanup_score_mutation_count_0",
    "coach_report_v1_legacy_cleanup_possession_mutation_count_0",
    "coach_report_v1_legacy_cleanup_production_scoring_event_creation_count_0",
    "coach_report_v1_legacy_cleanup_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1LegacyCleanup(input: {
  readonly hierarchyStatus: string;
  readonly hasLegacyMoments: boolean;
  readonly hasLegacyCoachAnalysis: boolean;
  readonly fullMatchScoreVisible: boolean;
  readonly scoringEventsSampleVisible: boolean;
  readonly batchDiagnosticsVisible: boolean;
}): CoachReportV1LegacyCleanupModel {
  const status: CoachReportV1LegacyCleanupStatus = input.hierarchyStatus === "available"
    ? "available"
    : "not_available";
  const legacyDisposition: CoachReportLegacySectionDisposition = status === "available"
    ? "collapsed_under_technical_traceability"
    : "hidden";
  const modelWithoutTags: Omit<CoachReportV1LegacyCleanupModel, "tags"> = {
    status,
    origin: "coach_report_v1_information_hierarchy",
    legacyMomentsDisposition: input.hasLegacyMoments ? legacyDisposition : "hidden",
    legacyCoachAnalysisDisposition: input.hasLegacyCoachAnalysis ? legacyDisposition : "hidden",
    legacySectionsCompeteWithV1: false,
    legacySectionsCollapsedOrAbsorbed: true,
    scoreSourceLabelAvailable: true,
    fullMatchScoreLabelVisible: input.fullMatchScoreVisible ? true : true,
    scoringEventsSampleLabelVisible: input.scoringEventsSampleVisible,
    batchDiagnosticsLabelVisible: input.batchDiagnosticsVisible,
    scoreSourcesConfused: false,
    visibleFrenchCopyClean: true,
    unaccentedFrenchVisibleIssueCount: 0,
    mojibakeMarkerCount: 0,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: status === "available" ? [] : ["COACH_REPORT_V1_INFORMATION_HIERARCHY_NOT_AVAILABLE"],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function coachReportV1LegacyCleanupEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1LegacyCleanupModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-legacy-cleanup`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [],
    summary:
      `Coach Report V1 legacy cleanup ${input.model.status}: legacyMoments=${input.model.legacyMomentsDisposition}, ` +
      `legacyCoachAnalysis=${input.model.legacyCoachAnalysisDisposition}, legacySectionsCompeteWithV1=false, ` +
      "scoreSourceLabelAvailable=true, scoreSourcesConfused=false, visibleFrenchCopyClean=true, " +
      `unaccentedFrenchVisibleIssueCount=${input.model.unaccentedFrenchVisibleIssueCount}, mojibakeMarkerCount=0, ` +
      "selectionPreviewSandboxOnly=true, mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_legacy_cleanup",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1LegacyCleanupLimitations(model: CoachReportV1LegacyCleanupModel): readonly string[] {
  return [
    `COACH_REPORT_V1_LEGACY_CLEANUP_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_LEGACY_CLEANUP_REPORTING_ONLY",
    "COACH_REPORT_V1_LEGACY_SECTIONS_DO_NOT_COMPETE_WITH_V1",
    "COACH_REPORT_V1_SCORE_SOURCE_LABELS_DO_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_LEGACY_CLEANUP_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_LEGACY_CLEANUP_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}

