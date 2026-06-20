import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistorySaveResult } from "./coachMatchHistoryStore";

export type DatabaseCoachMatchHistoryAdapterStatus =
  | "contract_only"
  | "mock_available"
  | "implemented"
  | "failed";

export type DatabaseCoachMatchHistoryAdapterKind =
  | "future_database"
  | "mock_database"
  | "production_database";

export interface DatabaseCoachMatchHistoryAdapterDescription {
  readonly adapterKind: DatabaseCoachMatchHistoryAdapterKind;
  readonly status: DatabaseCoachMatchHistoryAdapterStatus;
  readonly durable: true;
  readonly readOnlyForReports: true;
  readonly supportsSaveResultSemantics: true;
  readonly supportsInserted: true;
  readonly supportsReplaced: true;
  readonly supportsIgnoredDuplicate: true;
  readonly supportsQueryByTeam: true;
  readonly supportsQueryByPhase: true;
  readonly supportsQueryBySeason: boolean;
  readonly supportsQueryByCompetition: boolean;
  readonly implemented: boolean;
  readonly productionReady: boolean;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
}

export interface DatabaseCoachMatchHistoryAdapterSpi {
  readonly adapterKind: DatabaseCoachMatchHistoryAdapterKind;

  describe(): DatabaseCoachMatchHistoryAdapterDescription;

  dryRunSave(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult;

  dryRunQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  listDryRunRecords(): readonly CoachMatchHistoryRecord[];
}
