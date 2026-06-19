import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";

export type CoachMatchHistoryStoreKind =
  | "in_memory"
  | "file_backed"
  | "future_database";

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

  save(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord;

  query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  listAll(): readonly CoachMatchHistoryRecord[];

  describe(): CoachMatchHistoryStoreDescription;
}
