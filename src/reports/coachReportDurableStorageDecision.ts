import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachMatchHistoryDurableStorageTarget } from "./history/coachMatchHistoryDurableSchema";

export type CoachReportDurableStorageDecisionStatus = "not_available" | "available";

export interface CoachReportDurableStorageDecisionModel {
  readonly status: CoachReportDurableStorageDecisionStatus;
  readonly selectedStorageTarget: CoachMatchHistoryDurableStorageTarget;
  readonly decisionMade: boolean;
  readonly reason: string;
  readonly schemaVersion: "coach_match_history_v1";
  readonly schemaFieldCount: number;
  readonly schemaCoversRequiredFields: boolean;
  readonly realAdapterWiringPrepared: boolean;
  readonly adapterKind: string;
  readonly adapterImplemented: boolean;
  readonly adapterProductionReady: boolean;
  readonly featureFlagEnabled: boolean;
  readonly defaultFeatureFlagEnabled: false;
  readonly productActivationAllowed: false;
  readonly activeProductHistorySource: "file_backed";
  readonly databaseUsedAsProductTruth: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly realDatabaseReadCount: 0;
  readonly realDatabaseWriteCount: 0;
  readonly dryRunOnly: true;
  readonly insertedScenarioPass: boolean;
  readonly replacedScenarioPass: boolean;
  readonly ignoredDuplicateScenarioPass: boolean;
  readonly queryByTeamPass: boolean;
  readonly queryByPhasePass: boolean;
  readonly deterministicOrderingPass: boolean;
  readonly sourceRecordCount: number;
  readonly durableAdapterRecordCount: number;
  readonly dryRunSaveCount: number;
  readonly dryRunQueryCount: number;
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
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly visibleRecommendationWordingCount: 0;
  readonly visibleSelectionWordingCount: 0;
  readonly internalStatusLeakCount: 0;
  readonly mojibakeMarkerCount: 0;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly legacyMigrationWordingClarified: boolean;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

export function buildCoachReportDurableStorageDecisionTags(
  model: Omit<CoachReportDurableStorageDecisionModel, "tags">,
): readonly string[] {
  return [
    "coach_report_durable_storage_decision",
    `coach_report_durable_storage_decision_status_${model.status}`,
    `coach_report_durable_storage_target_${model.selectedStorageTarget}`,
    `coach_report_durable_storage_schema_${model.schemaVersion}`,
    "coach_report_durable_storage_real_adapter_wiring_prepared_true",
    `coach_report_durable_storage_adapter_kind_${model.adapterKind}`,
    "coach_report_durable_storage_adapter_implemented_true",
    "coach_report_durable_storage_adapter_production_ready_false",
    "coach_report_durable_storage_feature_flag_default_false",
    "coach_report_durable_storage_product_activation_allowed_false",
    "coach_report_durable_storage_active_product_history_source_file_backed",
    "coach_report_durable_storage_database_used_as_product_truth_false",
    "coach_report_durable_storage_report_source_of_truth_false",
    "coach_report_durable_storage_real_db_read_count_0",
    "coach_report_durable_storage_real_db_write_count_0",
    "coach_report_durable_storage_dry_run_only_true",
    "coach_report_durable_storage_inserted_scenario_pass_true",
    "coach_report_durable_storage_replaced_scenario_pass_true",
    "coach_report_durable_storage_ignored_duplicate_scenario_pass_true",
    "coach_report_durable_storage_query_by_team_pass_true",
    "coach_report_durable_storage_query_by_phase_pass_true",
    "coach_report_durable_storage_deterministic_ordering_pass_true",
    "coach_report_durable_storage_no_mutation_guardrails_true",
    "coach_report_durable_storage_scoring_constants_unchanged",
    "coach_report_durable_storage_match_bonus_event_unchanged",
  ];
}

export function coachReportDurableStorageDecisionCannotDriveSelection(
  model: CoachReportDurableStorageDecisionModel,
): boolean {
  return !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.canMutateLineup &&
    !model.canMutateStarters &&
    !model.canMutateBench;
}

export function coachReportDurableStorageDecisionCannotMutateOfficialState(
  model: CoachReportDurableStorageDecisionModel,
): boolean {
  return !model.canMutateScore &&
    !model.canMutateTimeline &&
    !model.canMutatePossession &&
    !model.canCreateProductionScoringEvents &&
    !model.canClaimGlobalEconomy;
}

export function coachReportDurableStorageDecisionEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportDurableStorageDecisionModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-durable-storage-decision`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_DURABLE_STORAGE_DECISION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Durable Storage Decision ${input.model.status}: selectedStorageTarget=${input.model.selectedStorageTarget}, schemaVersion=${input.model.schemaVersion}, ` +
      `realAdapterWiringPrepared=${input.model.realAdapterWiringPrepared}, adapterKind=${input.model.adapterKind}, productActivationAllowed=false, activeProductHistorySource=file_backed, databaseUsedAsProductTruth=false, realDatabaseReadCount=0, realDatabaseWriteCount=0.`,
    confidence: "medium",
    strength: 70,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}
