import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type {
  CoachMatchHistorySaveResult,
  CoachMatchHistoryStore,
} from "./coachMatchHistoryStore";
import {
  coachMatchHistoryRecordsHaveSameContent,
  cloneCoachMatchHistoryRecord,
  sortCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  if (teamId === undefined) {
    return true;
  }

  return record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function queryWarnings(records: readonly CoachMatchHistoryRecord[]): readonly string[] {
  const warnings: string[] = [];

  if (records.some((record) => record.source === "controlled_sample")) {
    warnings.push("Controlled local samples remain visible in this in-memory history store.");
  }

  if (!records.some((record) => record.source === "product_history_store")) {
    warnings.push("No durable product history store is connected yet.");
  }

  return warnings;
}

export function createInMemoryCoachMatchHistoryStore(
  initialRecords: readonly CoachMatchHistoryRecord[] = [],
): CoachMatchHistoryStore {
  const records = sortCoachMatchHistoryRecords(initialRecords).map(cloneCoachMatchHistoryRecord);

  return {
    storeKind: "in_memory",
    save(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult {
      const next = cloneCoachMatchHistoryRecord(record);
      const existingIndex = records.findIndex((candidate) => candidate.historyRecordId === next.historyRecordId);
      const recordsBeforeSaveCount = records.length;
      let replacedRecordCount = 0;
      let ignoredDuplicateCount = 0;
      let operation: CoachMatchHistorySaveResult["operation"] = "inserted";

      if (existingIndex >= 0) {
        const existing = records[existingIndex];
        if (existing !== undefined && coachMatchHistoryRecordsHaveSameContent(existing, next)) {
          operation = "ignored_duplicate";
          ignoredDuplicateCount = 1;
        } else {
          records[existingIndex] = next;
          operation = "replaced";
          replacedRecordCount = 1;
        }
      } else {
        records.push(next);
      }

      records.sort((left, right) =>
        left.generatedAtIso.localeCompare(right.generatedAtIso) ||
        left.matchId.localeCompare(right.matchId) ||
        left.historyRecordId.localeCompare(right.historyRecordId)
      );

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
        warnings: queryWarnings(records),
      };
    },
    query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
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
        warnings: queryWarnings(filtered),
      };
    },
    listAll(): readonly CoachMatchHistoryRecord[] {
      return records.map(cloneCoachMatchHistoryRecord);
    },
    describe() {
      return {
        storeKind: "in_memory",
        durable: false,
        readOnlyForReports: true,
        canDriveCoachInstruction: false,
        canDriveLiveSelection: false,
        canDriveProductionRouteResolution: false,
        canMutateScore: false,
        canCreateScoringEvent: false,
        canClaimGlobalEconomy: false,
        warning: "In-memory history resets between process runs.",
      };
    },
  };
}
