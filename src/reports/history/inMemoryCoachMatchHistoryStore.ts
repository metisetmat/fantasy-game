import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
  CoachMatchHistorySignal,
} from "./coachMatchHistory";
import type { CoachMatchHistoryStore } from "./coachMatchHistoryStore";

function cloneSignal(signal: CoachMatchHistorySignal): CoachMatchHistorySignal {
  return { ...signal };
}

function cloneRecord(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
  return {
    ...record,
    signals: record.signals.map(cloneSignal),
  };
}

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
  const records = initialRecords.map(cloneRecord);

  return {
    storeKind: "in_memory",
    save(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
      const next = cloneRecord(record);
      const existingIndex = records.findIndex((candidate) => candidate.historyRecordId === next.historyRecordId);

      if (existingIndex >= 0) {
        records[existingIndex] = next;
      } else {
        records.push(next);
      }

      return cloneRecord(next);
    },
    query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      const filtered = records
        .filter((record) => query.includeControlledSamples || record.source !== "controlled_sample")
        .filter((record) => query.includeProductHistory || record.source !== "product_history_store")
        .filter((record) => matchesTeam(record, query.teamId))
        .map(cloneRecord)
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
      return records.map(cloneRecord);
    },
  };
}

