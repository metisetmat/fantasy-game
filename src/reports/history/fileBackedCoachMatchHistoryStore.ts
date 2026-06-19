import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type {
  CoachMatchHistoryStore,
  CoachMatchHistoryStoreDescription,
} from "./coachMatchHistoryStore";
import {
  cloneCoachMatchHistoryRecord,
  parseCoachMatchHistoryRecords,
  serializeCoachMatchHistoryRecords,
  sortCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  if (teamId === undefined) {
    return true;
  }

  return record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function queryWarnings(records: readonly CoachMatchHistoryRecord[], description: CoachMatchHistoryStoreDescription): readonly string[] {
  const warnings: string[] = [];

  if (records.some((record) => record.source === "controlled_sample")) {
    warnings.push("Controlled local samples remain visible in this persisted history store.");
  }

  if (description.warning !== undefined) {
    warnings.push(description.warning);
  }

  return warnings;
}

function buildDescription(filePath: string, allowWrite: boolean): CoachMatchHistoryStoreDescription {
  return {
    storeKind: "file_backed",
    durable: allowWrite,
    readOnlyForReports: true,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    storageLocation: filePath,
    ...(allowWrite ? {} : { warning: "File-backed store is currently read-only and will not persist new writes." }),
  };
}

function writeRecords(filePath: string, records: readonly CoachMatchHistoryRecord[]): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, serializeCoachMatchHistoryRecords(records), "utf8");
}

export function createFileBackedCoachMatchHistoryStore(input: {
  readonly filePath: string;
  readonly initialRecords?: readonly CoachMatchHistoryRecord[];
  readonly allowWrite: boolean;
}): CoachMatchHistoryStore {
  const initialRecords = input.initialRecords ?? [];
  const description = buildDescription(input.filePath, input.allowWrite);
  let records: readonly CoachMatchHistoryRecord[] = sortCoachMatchHistoryRecords(initialRecords);

  if (existsSync(input.filePath)) {
    try {
      const fromDisk = parseCoachMatchHistoryRecords(readFileSync(input.filePath, "utf8"));
      const merged = new Map<string, CoachMatchHistoryRecord>();

      for (const record of [...fromDisk, ...records]) {
        merged.set(record.historyRecordId, cloneCoachMatchHistoryRecord(record));
      }

      records = sortCoachMatchHistoryRecords([...merged.values()]);
    } catch {
      records = sortCoachMatchHistoryRecords(initialRecords);
    }
  } else if (input.allowWrite) {
    writeRecords(input.filePath, records);
  }

  const saveRecord = (record: CoachMatchHistoryRecord): CoachMatchHistoryRecord => {
    const next = cloneCoachMatchHistoryRecord(record);
    const merged = new Map<string, CoachMatchHistoryRecord>(
      records.map((candidate) => [candidate.historyRecordId, cloneCoachMatchHistoryRecord(candidate)]),
    );
    merged.set(next.historyRecordId, next);
    records = sortCoachMatchHistoryRecords([...merged.values()]);

    if (input.allowWrite) {
      writeRecords(input.filePath, records);
    }

    return cloneCoachMatchHistoryRecord(next);
  };

  const queryRecords = (query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult => {
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
      warnings: queryWarnings(filtered, description),
    };
  };

  return {
    storeKind: "file_backed",
    save(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
      return saveRecord(record);
    },
    query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      return queryRecords(query);
    },
    listAll(): readonly CoachMatchHistoryRecord[] {
      return records.map(cloneCoachMatchHistoryRecord);
    },
    describe(): CoachMatchHistoryStoreDescription {
      return description;
    },
  };
}
