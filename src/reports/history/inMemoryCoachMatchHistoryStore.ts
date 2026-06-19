import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistoryStore } from "./coachMatchHistoryStore";
import {
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
    save(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
      const next = cloneCoachMatchHistoryRecord(record);
      const existingIndex = records.findIndex((candidate) => candidate.historyRecordId === next.historyRecordId);

      if (existingIndex >= 0) {
        records[existingIndex] = next;
      } else {
        records.push(next);
      }

      records.sort((left, right) =>
        left.generatedAtIso.localeCompare(right.generatedAtIso) ||
        left.historyRecordId.localeCompare(right.historyRecordId)
      );

      return cloneCoachMatchHistoryRecord(next);
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
