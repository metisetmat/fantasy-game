export interface DatabaseCoachMatchHistoryAdapterContract {
  readonly contractName: "DatabaseCoachMatchHistoryAdapterContract";
  readonly implemented: false;
  readonly migrationRequired: true;
  readonly expectedStoreKind: "future_database";
  readonly mustPreserveSaveResultSemantics: true;
  readonly mustSupportIdempotentSave: true;
  readonly mustSupportReplaceByHistoryRecordId: true;
  readonly mustReturnLoadedAndWrittenCounts: true;
  readonly mustRemainReadOnlyForReports: true;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly notes: readonly string[];
}

export function describeFutureDatabaseCoachMatchHistoryAdapter(): DatabaseCoachMatchHistoryAdapterContract {
  return {
    contractName: "DatabaseCoachMatchHistoryAdapterContract",
    implemented: false,
    migrationRequired: true,
    expectedStoreKind: "future_database",
    mustPreserveSaveResultSemantics: true,
    mustSupportIdempotentSave: true,
    mustSupportReplaceByHistoryRecordId: true,
    mustReturnLoadedAndWrittenCounts: true,
    mustRemainReadOnlyForReports: true,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    notes: [
      "Future database storage must preserve the same inserted/replaced/ignored_duplicate contract as the local stores.",
      "Database history remains report evidence only and cannot mutate score, lineup, live selection, or scoring events.",
    ],
  };
}
