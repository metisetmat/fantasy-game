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
  parseCoachMatchHistoryRecords,
  serializeCoachMatchHistoryRecords,
  sortCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";

export interface ExperimentalCoachMatchHistoryRow {
  readonly historyRecordId: string;
  readonly matchId: string;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly generatedAtIso: string;
  readonly source: string;
  readonly serializedRecord: string;
}

function rowFromRecord(record: CoachMatchHistoryRecord): ExperimentalCoachMatchHistoryRow {
  return {
    historyRecordId: record.historyRecordId,
    matchId: record.matchId,
    homeTeamId: record.homeTeamId,
    awayTeamId: record.awayTeamId,
    generatedAtIso: record.generatedAtIso,
    source: record.source,
    serializedRecord: serializeCoachMatchHistoryRecords([record]),
  };
}

function recordFromRow(row: ExperimentalCoachMatchHistoryRow): CoachMatchHistoryRecord {
  const [record] = parseCoachMatchHistoryRecords(row.serializedRecord);
  if (record === undefined) {
    throw new Error(`Experimental database row ${row.historyRecordId} has no serialized record.`);
  }

  return record;
}

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  return teamId === undefined || record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function description(flag: DatabaseHistoryAdapterFeatureFlag): DatabaseCoachMatchHistoryAdapterDescription {
  return {
    adapterKind: "experimental_database",
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

export function createExperimentalDatabaseCoachMatchHistoryAdapter(input: {
  readonly initialRecords?: readonly CoachMatchHistoryRecord[];
  readonly featureFlag?: DatabaseHistoryAdapterFeatureFlag;
} = {}): DatabaseCoachMatchHistoryAdapterSpi {
  const featureFlag = input.featureFlag ?? resolveDatabaseHistoryAdapterFeatureFlag();
  let rows = sortCoachMatchHistoryRecords(input.initialRecords ?? []).map(rowFromRecord);

  const orderedRecords = (): readonly CoachMatchHistoryRecord[] =>
    sortCoachMatchHistoryRecords(rows.map(recordFromRow));

  return {
    adapterKind: "experimental_database",
    describe(): DatabaseCoachMatchHistoryAdapterDescription {
      return description(featureFlag);
    },
    dryRunSave(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult {
      const next = cloneCoachMatchHistoryRecord(record);
      const existingIndex = rows.findIndex((row) => row.historyRecordId === next.historyRecordId);
      const recordsBeforeSaveCount = rows.length;
      let operation: CoachMatchHistorySaveResult["operation"] = "inserted";
      let replacedRecordCount = 0;
      let ignoredDuplicateCount = 0;

      if (existingIndex >= 0) {
        const existingRow = rows[existingIndex];
        const existingRecord = existingRow === undefined ? undefined : recordFromRow(existingRow);
        if (existingRecord !== undefined && coachMatchHistoryRecordsHaveSameContent(existingRecord, next)) {
          operation = "ignored_duplicate";
          ignoredDuplicateCount = 1;
        } else {
          const merged = new Map<string, ExperimentalCoachMatchHistoryRow>(
            rows.map((row) => [row.historyRecordId, row]),
          );
          merged.set(next.historyRecordId, rowFromRecord(next));
          rows = sortCoachMatchHistoryRecords([...merged.values()].map(recordFromRow)).map(rowFromRecord);
          operation = "replaced";
          replacedRecordCount = 1;
        }
      } else {
        rows = sortCoachMatchHistoryRecords([...orderedRecords(), next]).map(rowFromRecord);
      }

      return {
        operation,
        record: cloneCoachMatchHistoryRecord(next),
        recordsBeforeSaveCount,
        recordsAfterSaveCount: rows.length,
        loadedFromDiskCount: 0,
        writtenToDiskCount: 0,
        dedupedRecordCount: existingIndex >= 0 ? 1 : 0,
        replacedRecordCount,
        ignoredDuplicateCount,
        idempotent: operation === "ignored_duplicate",
        warnings: [
          "Experimental database adapter dryRunSave did not write to a real database.",
        ],
      };
    },
    dryRunQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      const filtered = orderedRecords()
        .filter((record) => query.includeControlledSamples || record.source !== "controlled_sample")
        .filter((record) => query.includeProductHistory || record.source !== "product_history_store")
        .filter((record) => matchesTeam(record, query.teamId))
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
        records: filtered.map(cloneCoachMatchHistoryRecord),
        warnings: [
          "Experimental database adapter dryRunQuery did not read from a real database.",
        ],
      };
    },
    listDryRunRecords(): readonly CoachMatchHistoryRecord[] {
      return orderedRecords().map(cloneCoachMatchHistoryRecord);
    },
  };
}
