import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistorySaveResult } from "./coachMatchHistoryStore";
import {
  cloneCoachMatchHistoryRecord,
  sortCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";
import {
  COACH_MATCH_HISTORY_SCHEMA_VERSION,
  coachMatchHistoryRecordMatchesDurableSchema,
} from "./coachMatchHistoryDurableSchema";
import type {
  DatabaseCoachMatchHistoryAdapterKind,
  DatabaseCoachMatchHistoryAdapterStatus,
} from "./databaseCoachMatchHistoryAdapterSpi";

export type ControlledLocalReadOnlyDbModeName = "controlled_local_readonly_db";

export interface SqliteLocalReadOnlyCoachMatchHistoryAdapterDescription {
  readonly adapterKind: "sqlite_local_readonly_controlled";
  readonly status: DatabaseCoachMatchHistoryAdapterStatus;
  readonly modeName: ControlledLocalReadOnlyDbModeName;
  readonly schemaVersion: typeof COACH_MATCH_HISTORY_SCHEMA_VERSION;
  readonly durable: true;
  readonly readOnlyForReports: true;
  readonly supportsQueryByTeam: true;
  readonly supportsQueryByPhase: true;
  readonly supportsQueryBySeason: false;
  readonly supportsQueryByCompetition: false;
  readonly implemented: true;
  readonly productionReady: false;
  readonly featureFlagEnabled: boolean;
  readonly productActivationAllowed: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly realDatabaseReadCount: 0;
  readonly realDatabaseWriteCount: 0;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly readOnlyMode: true;
  readonly writeModeAllowed: false;
  readonly defaultEnabled: false;
  readonly controlledReadAttemptCount: number;
  readonly writeRejectedCount: number;
  readonly schemaCompatibleRecordCount: number;
  readonly schemaIncompatibleRecordCount: number;
}

export interface SqliteLocalReadOnlyCoachMatchHistoryAdapter {
  readonly adapterKind: DatabaseCoachMatchHistoryAdapterKind;

  describe(): SqliteLocalReadOnlyCoachMatchHistoryAdapterDescription;

  readOnlyQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  rejectWrite(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult;

  listReadOnlyRecords(): readonly CoachMatchHistoryRecord[];
}

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  return teamId === undefined || record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function countCompatible(records: readonly CoachMatchHistoryRecord[]): number {
  return records.filter(coachMatchHistoryRecordMatchesDurableSchema).length;
}

function description(input: {
  readonly featureFlagEnabled: boolean;
  readonly controlledReadAttemptCount: number;
  readonly writeRejectedCount: number;
  readonly records: readonly CoachMatchHistoryRecord[];
}): SqliteLocalReadOnlyCoachMatchHistoryAdapterDescription {
  const schemaCompatibleRecordCount = countCompatible(input.records);

  return {
    adapterKind: "sqlite_local_readonly_controlled",
    modeName: "controlled_local_readonly_db",
    status: "implemented",
    durable: true,
    readOnlyForReports: true,
    supportsQueryByTeam: true,
    supportsQueryByPhase: true,
    supportsQueryBySeason: false,
    supportsQueryByCompetition: false,
    implemented: true,
    productionReady: false,
    featureFlagEnabled: input.featureFlagEnabled,
    productActivationAllowed: false,
    reportCanUseAsSourceOfTruth: false,
    realDatabaseReadCount: 0,
    realDatabaseWriteCount: 0,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    schemaVersion: COACH_MATCH_HISTORY_SCHEMA_VERSION,
    readOnlyMode: true,
    writeModeAllowed: false,
    defaultEnabled: false,
    controlledReadAttemptCount: input.controlledReadAttemptCount,
    writeRejectedCount: input.writeRejectedCount,
    schemaCompatibleRecordCount,
    schemaIncompatibleRecordCount: input.records.length - schemaCompatibleRecordCount,
  };
}

export function createSqliteLocalReadOnlyCoachMatchHistoryAdapter(input: {
  readonly initialRecords?: readonly CoachMatchHistoryRecord[];
  readonly featureFlagEnabled?: boolean;
} = {}): SqliteLocalReadOnlyCoachMatchHistoryAdapter {
  const records = sortCoachMatchHistoryRecords(input.initialRecords ?? []);
  const featureFlagEnabled = input.featureFlagEnabled ?? false;
  let controlledReadAttemptCount = 0;
  let writeRejectedCount = 0;

  return {
    adapterKind: "sqlite_local_readonly_controlled",
    describe(): SqliteLocalReadOnlyCoachMatchHistoryAdapterDescription {
      return description({
        featureFlagEnabled,
        controlledReadAttemptCount,
        writeRejectedCount,
        records,
      });
    },
    readOnlyQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      controlledReadAttemptCount += 1;
      const filtered = records
        .filter((record) => query.includeControlledSamples || record.source !== "controlled_sample")
        .filter((record) => query.includeProductHistory || record.source !== "product_history_store")
        .filter((record) => matchesTeam(record, query.teamId))
        .filter((record) => query.phase === undefined || record.signals.some((signal) => signal.phase === query.phase))
        .slice(0, Math.max(0, query.maxRecords))
        .map(cloneCoachMatchHistoryRecord);
      const signalCount = filtered.reduce(
        (total, record) => total + (query.phase === undefined
          ? record.signals.length
          : record.signals.filter((signal) => signal.phase === query.phase).length),
        0,
      );

      return {
        status: filtered.length === 0 ? "partial" : "available",
        query: { ...query },
        recordCount: filtered.length,
        signalCount,
        records: filtered,
        warnings: [
          "controlled_local_readonly_db uses a structured local read-only contract in Sprint 5G; no real SQLite IO occurs.",
        ],
      };
    },
    rejectWrite(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult {
      writeRejectedCount += 1;

      return {
        operation: "rejected_write",
        record: cloneCoachMatchHistoryRecord(record),
        recordsBeforeSaveCount: records.length,
        recordsAfterSaveCount: records.length,
        loadedFromDiskCount: 0,
        writtenToDiskCount: 0,
        dedupedRecordCount: 0,
        replacedRecordCount: 0,
        ignoredDuplicateCount: 0,
        idempotent: false,
        warnings: [
          "Write rejected: controlled_local_readonly_db is read-only in Sprint 5G.",
        ],
      };
    },
    listReadOnlyRecords(): readonly CoachMatchHistoryRecord[] {
      return records.map(cloneCoachMatchHistoryRecord);
    },
  };
}
