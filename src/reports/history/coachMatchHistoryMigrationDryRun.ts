import type { CoachMatchHistorySaveOperation } from "./coachMatchHistoryStore";

export type CoachMatchHistoryMigrationDryRunStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachMatchHistoryMigrationRecordStatus =
  | "migrable"
  | "would_replace"
  | "would_ignore_duplicate"
  | "rejected_invalid"
  | "rejected_unsupported";

export interface CoachMatchHistoryMigrationRecordPlan {
  readonly historyRecordId: string;
  readonly matchId: string;
  readonly sourceStoreKind: "file_backed";
  readonly targetAdapterKind: "mock_database" | "future_database";
  readonly status: CoachMatchHistoryMigrationRecordStatus;
  readonly saveOperation?: CoachMatchHistorySaveOperation;
  readonly reason: string;
}

export interface CoachMatchHistoryMigrationDryRunModel {
  readonly status: CoachMatchHistoryMigrationDryRunStatus;
  readonly origin: "file_backed_history_store";
  readonly sourceStoreKind: "file_backed";
  readonly targetAdapterKind: "mock_database" | "future_database";
  readonly dryRunOnly: true;
  readonly realDatabaseWriteCount: 0;
  readonly realDatabaseReadCount: 0;
  readonly sourceRecordCount: number;
  readonly targetExistingRecordCount: number;
  readonly migrationPlanCount: number;
  readonly migrableRecordCount: number;
  readonly wouldInsertCount: number;
  readonly wouldReplaceCount: number;
  readonly wouldIgnoreDuplicateCount: number;
  readonly rejectedInvalidCount: number;
  readonly rejectedUnsupportedCount: number;
  readonly migrationPlans: readonly CoachMatchHistoryMigrationRecordPlan[];
  readonly preservesSaveResultSemantics: true;
  readonly preservesReadOnlyReportQueries: true;
  readonly databaseAdapterImplemented: false;
  readonly databaseAdapterProductionReady: false;
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly scoreMutationCount: 0;
  readonly possessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly globalEconomyClaimCount: 0;
  readonly noAutomaticSelection: true;
  readonly playerSelectedCount: 0;
  readonly lineupMutationCount: 0;
  readonly startersMutationCount: 0;
  readonly benchMutationCount: 0;
  readonly liveSelectionDriverCount: 0;
  readonly productionRouteResolutionDriverCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly officiallyConfirmedCount: 0;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly warnings: readonly string[];
  readonly tags: readonly string[];
}
