import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistorySaveResult } from "./coachMatchHistoryStore";
import type { DatabaseHistoryAdapterFeatureFlag } from "./databaseHistoryAdapterFeatureFlag";
import { resolveDatabaseHistoryAdapterFeatureFlag } from "./databaseHistoryAdapterFeatureFlag";
import type {
  DatabaseCoachMatchHistoryAdapterDescription,
  DatabaseCoachMatchHistoryAdapterSpi,
} from "./databaseCoachMatchHistoryAdapterSpi";
import {
  coachMatchHistoryRecordsHaveSameContent,
  cloneCoachMatchHistoryRecord,
  sortCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  return teamId === undefined || record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function description(flag: DatabaseHistoryAdapterFeatureFlag): DatabaseCoachMatchHistoryAdapterDescription {
  return {
    adapterKind: "sqlite_local_disabled",
    status: "implemented",
    durable: true,
    readOnlyForReports: true,
    supportsSaveResultSemantics: true,
    supportsInserted: true,
    supportsReplaced: true,
    supportsIgnoredDuplicate: true,
    supportsQueryByTeam: true,
    supportsQueryByPhase: true,
    supportsQueryBySeason: false,
    supportsQueryByCompetition: false,
    implemented: true,
    productionReady: false,
    featureFlagEnabled: flag.enabled,
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
  };
}

export function createSqliteLocalCoachMatchHistoryAdapter(input: {
  readonly initialRecords?: readonly CoachMatchHistoryRecord[];
  readonly featureFlag?: DatabaseHistoryAdapterFeatureFlag;
} = {}): DatabaseCoachMatchHistoryAdapterSpi {
  const featureFlag = input.featureFlag ?? resolveDatabaseHistoryAdapterFeatureFlag();
  let records = sortCoachMatchHistoryRecords(input.initialRecords ?? []);

  return {
    adapterKind: "sqlite_local_disabled",
    describe(): DatabaseCoachMatchHistoryAdapterDescription {
      return description(featureFlag);
    },
    dryRunSave(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult {
      const next = cloneCoachMatchHistoryRecord(record);
      const existingIndex = records.findIndex((candidate) => candidate.historyRecordId === next.historyRecordId);
      const recordsBeforeSaveCount = records.length;
      let operation: CoachMatchHistorySaveResult["operation"] = "inserted";
      let replacedRecordCount = 0;
      let ignoredDuplicateCount = 0;

      if (existingIndex >= 0) {
        const existing = records[existingIndex];
        if (existing !== undefined && coachMatchHistoryRecordsHaveSameContent(existing, next)) {
          operation = "ignored_duplicate";
          ignoredDuplicateCount = 1;
        } else {
          const merged = new Map<string, CoachMatchHistoryRecord>(
            records.map((candidate) => [candidate.historyRecordId, cloneCoachMatchHistoryRecord(candidate)]),
          );
          merged.set(next.historyRecordId, next);
          records = sortCoachMatchHistoryRecords([...merged.values()]);
          operation = "replaced";
          replacedRecordCount = 1;
        }
      } else {
        records = sortCoachMatchHistoryRecords([...records, next]);
      }

      return {
        operation,
        record: cloneCoachMatchHistoryRecord(next),
        recordsBeforeSaveCount,
        recordsAfterSaveCount: records.length,
        loadedFromDiskCount: 0,
        writtenToDiskCount: 0,
        dedupedRecordCount: existingIndex >= 0 ? 1 : 0,
        replacedRecordCount,
        ignoredDuplicateCount,
        idempotent: operation === "ignored_duplicate",
        warnings: [
          "SQLite local adapter wiring is disabled/no-IO in Sprint 5F; dryRunSave did not write to SQLite.",
        ],
      };
    },
    dryRunQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
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
          "SQLite local adapter wiring is disabled/no-IO in Sprint 5F; dryRunQuery did not read from SQLite.",
        ],
      };
    },
    listDryRunRecords(): readonly CoachMatchHistoryRecord[] {
      return records.map(cloneCoachMatchHistoryRecord);
    },
  };
}
