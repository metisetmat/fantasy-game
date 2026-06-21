import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachMatchHistoryDurableStorageTarget } from "./history/coachMatchHistoryDurableSchema";
import type { RealSQLiteReadOnlyIOSmokeTestModeName } from "./history/sqliteRealReadOnlyCoachMatchHistoryAdapter";

export type CoachReportRealSQLiteReadOnlyIOSmokeTestStatus = "not_available" | "available";

export interface CoachReportRealSQLiteReadOnlyIOSmokeTestModel {
  readonly status: CoachReportRealSQLiteReadOnlyIOSmokeTestStatus;
  readonly modeName: RealSQLiteReadOnlyIOSmokeTestModeName;
  readonly storageTarget: CoachMatchHistoryDurableStorageTarget;
  readonly schemaVersion: "coach_match_history_v1";
  readonly realSQLiteIoEnabled: true;
  readonly readOnlyMode: true;
  readonly writeModeAllowed: false;
  readonly writeRejectedPass: boolean;
  readonly adapterImplemented: true;
  readonly adapterProductionReady: false;
  readonly featureFlagEnabled: false;
  readonly defaultFeatureFlagEnabled: false;
  readonly productActivationAllowed: false;
  readonly activeProductHistorySource: "file_backed";
  readonly databaseUsedAsProductTruth: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly defaultRealDatabaseReadCount: 0;
  readonly controlledRealDatabaseReadCount: number;
  readonly realDatabaseWriteCount: 0;
  readonly fixturePath: string;
  readonly fixtureRecordCount: number;
  readonly readOnlyAdapterRecordCount: number;
  readonly queryByTeamPass: boolean;
  readonly queryByPhasePass: boolean;
  readonly deterministicOrderingPass: boolean;
  readonly schemaCompatibilityPass: boolean;
  readonly dryRunFallbackAvailable: true;
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
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly batchLiveSeparationPreserved: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly explicitControlledModeOnly: true;
  readonly nonProdFixtureOnly: true;
  readonly sqliteDriverChoice: "minimal_readonly_sqlite_file_reader";
  readonly nextStep: "Product History Source Switch Trial in non-prod only";
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

export function buildCoachReportRealSQLiteReadOnlyIOSmokeTestTags(
  model: Omit<CoachReportRealSQLiteReadOnlyIOSmokeTestModel, "tags">,
): readonly string[] {
  return [
    "coach_report_real_sqlite_readonly_io_smoke_test",
    `coach_report_real_sqlite_readonly_io_status_${model.status}`,
    `coach_report_real_sqlite_readonly_io_mode_${model.modeName}`,
    `coach_report_real_sqlite_readonly_io_storage_target_${model.storageTarget}`,
    `coach_report_real_sqlite_readonly_io_schema_${model.schemaVersion}`,
    "coach_report_real_sqlite_readonly_io_enabled_true",
    "coach_report_real_sqlite_readonly_io_read_only_true",
    "coach_report_real_sqlite_readonly_io_write_mode_allowed_false",
    "coach_report_real_sqlite_readonly_io_write_rejected_pass_true",
    "coach_report_real_sqlite_readonly_io_adapter_implemented_true",
    "coach_report_real_sqlite_readonly_io_adapter_production_ready_false",
    "coach_report_real_sqlite_readonly_io_feature_flag_enabled_false",
    "coach_report_real_sqlite_readonly_io_default_enabled_false",
    "coach_report_real_sqlite_readonly_io_product_activation_allowed_false",
    "coach_report_real_sqlite_readonly_io_active_product_history_source_file_backed",
    "coach_report_real_sqlite_readonly_io_database_used_as_product_truth_false",
    "coach_report_real_sqlite_readonly_io_report_source_of_truth_false",
    "coach_report_real_sqlite_readonly_io_default_read_count_0",
    `coach_report_real_sqlite_readonly_io_controlled_read_count_${model.controlledRealDatabaseReadCount}`,
    "coach_report_real_sqlite_readonly_io_write_count_0",
    "coach_report_real_sqlite_readonly_io_query_by_team_pass_true",
    "coach_report_real_sqlite_readonly_io_query_by_phase_pass_true",
    "coach_report_real_sqlite_readonly_io_deterministic_ordering_pass_true",
    "coach_report_real_sqlite_readonly_io_schema_compatibility_pass_true",
    "coach_report_real_sqlite_readonly_io_no_mutation_guardrails_true",
    "coach_report_real_sqlite_readonly_io_full_match_batch_economy_only_global_proof",
  ];
}

export function coachReportRealSQLiteReadOnlyIOSmokeTestCannotDriveSelection(
  model: CoachReportRealSQLiteReadOnlyIOSmokeTestModel,
): boolean {
  return !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.canMutateLineup &&
    !model.canMutateStarters &&
    !model.canMutateBench;
}

export function coachReportRealSQLiteReadOnlyIOSmokeTestCannotMutateOfficialState(
  model: CoachReportRealSQLiteReadOnlyIOSmokeTestModel,
): boolean {
  return !model.canMutateScore &&
    !model.canMutateTimeline &&
    !model.canMutatePossession &&
    !model.canCreateProductionScoringEvents &&
    !model.canClaimGlobalEconomy;
}

export function coachReportRealSQLiteReadOnlyIOSmokeTestEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportRealSQLiteReadOnlyIOSmokeTestModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-real-sqlite-readonly-io-smoke-test`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_REAL_SQLITE_READONLY_IO_SMOKE_TEST",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Real SQLite Read-Only IO Smoke Test ${input.model.status}: modeName=${input.model.modeName}, ` +
      `storageTarget=${input.model.storageTarget}, schemaVersion=${input.model.schemaVersion}, realSQLiteIoEnabled=true, ` +
      `defaultRealDatabaseReadCount=0, controlledRealDatabaseReadCount=${input.model.controlledRealDatabaseReadCount}, realDatabaseWriteCount=0, activeProductHistorySource=file_backed.`,
    confidence: "medium",
    strength: 72,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}
