import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistorySaveResult } from "./coachMatchHistoryStore";
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

function queryRecords(
  records: readonly CoachMatchHistoryRecord[],
  query: CoachMatchHistoryQuery,
): CoachMatchHistoryQueryResult {
  const filtered = records
    .filter((record) => query.includeControlledSamples || record.source !== "controlled_sample")
    .filter((record) => query.includeProductHistory || record.source !== "product_history_store")
    .filter((record) => matchesTeam(record, query.teamId))
    .map(cloneCoachMatchHistoryRecord)
    .filter((record) => query.phase === undefined || record.signals.some((signal) => signal.phase === query.phase))
    .slice(0, Math.max(0, query.maxRecords));
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
      "Mock database adapter is dry-run only; it performs no real database reads or writes.",
    ],
  };
}

function description(): DatabaseCoachMatchHistoryAdapterDescription {
  return {
    adapterKind: "mock_database",
    status: "mock_available",
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
    implemented: false,
    productionReady: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
  };
}

export function createMockDatabaseCoachMatchHistoryAdapter(input: {
  readonly initialRecords?: readonly CoachMatchHistoryRecord[];
} = {}): DatabaseCoachMatchHistoryAdapterSpi {
  let records = sortCoachMatchHistoryRecords(input.initialRecords ?? []);

  return {
    adapterKind: "mock_database",
    describe(): DatabaseCoachMatchHistoryAdapterDescription {
      return description();
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
          "Mock database adapter dryRunSave did not write to a real database.",
        ],
      };
    },
    dryRunQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      return queryRecords(records, query);
    },
    listDryRunRecords(): readonly CoachMatchHistoryRecord[] {
      return records.map(cloneCoachMatchHistoryRecord);
    },
  };
}
