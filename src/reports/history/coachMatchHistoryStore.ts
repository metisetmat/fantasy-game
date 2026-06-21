import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";

export type CoachMatchHistoryStoreKind =
  | "in_memory"
  | "file_backed"
  | "future_database";

export type CoachMatchHistorySaveOperation =
  | "inserted"
  | "replaced"
  | "ignored_duplicate"
  | "rejected_write";

export interface CoachMatchHistorySaveResult {
  readonly operation: CoachMatchHistorySaveOperation;
  readonly record: CoachMatchHistoryRecord;
  readonly recordsBeforeSaveCount: number;
  readonly recordsAfterSaveCount: number;
  readonly loadedFromDiskCount: number;
  readonly writtenToDiskCount: number;
  readonly dedupedRecordCount: number;
  readonly replacedRecordCount: number;
  readonly ignoredDuplicateCount: number;
  readonly idempotent: boolean;
  readonly warnings: readonly string[];
}

export interface CoachMatchHistoryStoreDescription {
  readonly storeKind: CoachMatchHistoryStoreKind;
  readonly durable: boolean;
  readonly readOnlyForReports: true;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly storageLocation?: string;
  readonly warning?: string;
}

export interface CoachMatchHistoryStore {
  readonly storeKind: CoachMatchHistoryStoreKind;

  save(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult;

  query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  listAll(): readonly CoachMatchHistoryRecord[];

  describe(): CoachMatchHistoryStoreDescription;
}
