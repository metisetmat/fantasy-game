import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachMatchHistoryDurableStorageTarget } from "./history/coachMatchHistoryDurableSchema";
import type { ControlledLocalReadOnlyDbModeName } from "./history/sqliteLocalReadOnlyCoachMatchHistoryAdapter";

export type CoachReportControlledLocalReadOnlyDbModeStatus = "not_available" | "available";

export interface CoachReportControlledLocalReadOnlyDbModeModel {
  readonly status: CoachReportControlledLocalReadOnlyDbModeStatus;
  readonly modeName: ControlledLocalReadOnlyDbModeName;
  readonly storageTarget: CoachMatchHistoryDurableStorageTarget;
  readonly schemaVersion: "coach_match_history_v1";
  readonly readOnlyMode: true;
  readonly writeModeAllowed: false;
  readonly writeRejectedPass: boolean;
  readonly productActivationAllowed: false;
  readonly defaultEnabled: false;
  readonly featureFlagEnabled: false;
  readonly activeProductHistorySource: "file_backed";
  readonly databaseUsedAsProductTruth: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canMutateTimeline: false;
  readonly canMutatePossession: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canMutateLineup: false;
  readonly canMutateStarters: false;
  readonly canMutateBench: false;
  readonly canClaimGlobalEconomy: false;
  readonly realDatabaseReadCount: 0;
  readonly realDatabaseWriteCount: 0;
  readonly controlledReadAttemptCount: number;
  readonly dryRunFallbackAvailable: true;
  readonly sourceRecordCount: number;
  readonly readOnlyRecordCount: number;
  readonly readOnlyQueryCount: number;
  readonly readOnlyQueryByTeamPass: boolean;
  readonly readOnlyQueryByPhasePass: boolean;
  readonly deterministicOrderingPass: boolean;
  readonly schemaCompatibilityPass: boolean;
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly visibleRecommendationWordingCount: 0;
  readonly visibleSelectionWordingCount: 0;
  readonly adapterImplemented: true;
  readonly adapterProductionReady: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly explicitControlledModeOnly: true;
  readonly trueSqliteIoDeferred: true;
  readonly nextStep: "Product History Source Switch Trial in non-prod only";
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

export function buildCoachReportControlledLocalReadOnlyDbModeTags(
  model: Omit<CoachReportControlledLocalReadOnlyDbModeModel, "tags">,
): readonly string[] {
  return [
    "coach_report_controlled_local_readonly_db_mode",
    `coach_report_controlled_local_readonly_db_mode_status_${model.status}`,
    `coach_report_controlled_local_readonly_db_mode_name_${model.modeName}`,
    `coach_report_controlled_local_readonly_db_storage_target_${model.storageTarget}`,
    `coach_report_controlled_local_readonly_db_schema_${model.schemaVersion}`,
    "coach_report_controlled_local_readonly_db_read_only_true",
    "coach_report_controlled_local_readonly_db_write_mode_allowed_false",
    "coach_report_controlled_local_readonly_db_write_rejected_pass_true",
    "coach_report_controlled_local_readonly_db_default_enabled_false",
    "coach_report_controlled_local_readonly_db_feature_flag_enabled_false",
    "coach_report_controlled_local_readonly_db_product_activation_allowed_false",
    "coach_report_controlled_local_readonly_db_active_product_history_source_file_backed",
    "coach_report_controlled_local_readonly_db_database_used_as_product_truth_false",
    "coach_report_controlled_local_readonly_db_report_source_of_truth_false",
    "coach_report_controlled_local_readonly_db_real_db_read_count_0",
    "coach_report_controlled_local_readonly_db_real_db_write_count_0",
    `coach_report_controlled_local_readonly_db_controlled_read_attempt_count_${model.controlledReadAttemptCount}`,
    "coach_report_controlled_local_readonly_db_query_by_team_pass_true",
    "coach_report_controlled_local_readonly_db_query_by_phase_pass_true",
    "coach_report_controlled_local_readonly_db_deterministic_ordering_pass_true",
    "coach_report_controlled_local_readonly_db_schema_compatibility_pass_true",
    "coach_report_controlled_local_readonly_db_no_mutation_guardrails_true",
    "coach_report_controlled_local_readonly_db_scoring_constants_unchanged",
    "coach_report_controlled_local_readonly_db_match_bonus_event_unchanged",
  ];
}

export function coachReportControlledLocalReadOnlyDbModeCannotDriveSelection(
  model: CoachReportControlledLocalReadOnlyDbModeModel,
): boolean {
  return !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.canMutateLineup &&
    !model.canMutateStarters &&
    !model.canMutateBench;
}

export function coachReportControlledLocalReadOnlyDbModeCannotMutateOfficialState(
  model: CoachReportControlledLocalReadOnlyDbModeModel,
): boolean {
  return !model.canMutateScore &&
    !model.canMutateTimeline &&
    !model.canMutatePossession &&
    !model.canCreateProductionScoringEvents &&
    !model.canClaimGlobalEconomy;
}

export function coachReportControlledLocalReadOnlyDbModeEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportControlledLocalReadOnlyDbModeModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-controlled-local-readonly-db-mode`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_CONTROLLED_LOCAL_READONLY_DB_MODE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Controlled Local Read-Only DB Mode ${input.model.status}: modeName=${input.model.modeName}, storageTarget=${input.model.storageTarget}, ` +
      `schemaVersion=${input.model.schemaVersion}, readOnlyMode=true, writeModeAllowed=false, productActivationAllowed=false, activeProductHistorySource=file_backed, databaseUsedAsProductTruth=false, realDatabaseReadCount=0, realDatabaseWriteCount=0.`,
    confidence: "medium",
    strength: 70,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}
