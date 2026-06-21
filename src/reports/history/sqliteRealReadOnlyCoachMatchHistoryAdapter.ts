import { readFileSync } from "node:fs";
import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";
import type { CoachMatchHistorySaveResult } from "./coachMatchHistoryStore";
import {
  cloneCoachMatchHistoryRecord,
  parseCoachMatchHistoryRecords,
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

export type RealSQLiteReadOnlyIOSmokeTestModeName = "real_sqlite_readonly_io_smoke_test";

const SQLITE_HEADER = "SQLite format 3\u0000";
const HISTORY_TABLE_NAME = "coach_match_history_v1";
const REQUIRED_COLUMNS = [
  "recordId",
  "matchId",
  "teamId",
  "opponentTeamId",
  "generatedAt",
  "source",
  "score",
  "phaseSignals",
  "evidenceSnapshotId",
  "createdAt",
  "updatedAt",
  "idempotencyKey",
  "schemaVersion",
] as const;

export interface SqliteRealReadOnlyCoachMatchHistoryAdapterDescription {
  readonly adapterKind: "sqlite_local_readonly_real_smoke_test";
  readonly status: DatabaseCoachMatchHistoryAdapterStatus;
  readonly modeName: RealSQLiteReadOnlyIOSmokeTestModeName;
  readonly schemaVersion: typeof COACH_MATCH_HISTORY_SCHEMA_VERSION;
  readonly durable: true;
  readonly readOnlyForReports: true;
  readonly supportsQueryByTeam: true;
  readonly supportsQueryByPhase: true;
  readonly supportsQueryBySeason: false;
  readonly supportsQueryByCompetition: false;
  readonly implemented: true;
  readonly productionReady: false;
  readonly featureFlagEnabled: false;
  readonly defaultFeatureFlagEnabled: false;
  readonly productActivationAllowed: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly databaseUsedAsProductTruth: false;
  readonly defaultRealDatabaseReadCount: 0;
  readonly controlledRealDatabaseReadCount: number;
  readonly realDatabaseWriteCount: 0;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly readOnlyMode: true;
  readonly writeModeAllowed: false;
  readonly writeRejectedCount: number;
  readonly fixturePath: string;
  readonly fixtureRecordCount: number;
  readonly schemaCompatibleRecordCount: number;
  readonly schemaIncompatibleRecordCount: number;
  readonly sqliteHeaderValid: boolean;
  readonly tableName: typeof HISTORY_TABLE_NAME;
  readonly requiredColumnCount: number;
  readonly missingRequiredColumnCount: number;
  readonly trueSqliteIoUsed: true;
}

export interface SqliteRealReadOnlyCoachMatchHistoryAdapter {
  readonly adapterKind: DatabaseCoachMatchHistoryAdapterKind;

  describe(): SqliteRealReadOnlyCoachMatchHistoryAdapterDescription;

  readOnlyQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  rejectWrite(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult;

  listReadOnlyRecords(): readonly CoachMatchHistoryRecord[];
}

interface SqliteDatabase {
  readonly buffer: Buffer;
  readonly pageSize: number;
}

interface VarintResult {
  readonly value: number;
  readonly nextOffset: number;
}

interface SqliteMasterRow {
  readonly type: string;
  readonly name: string;
  readonly tableName: string;
  readonly rootPage: number;
  readonly sql: string | null;
}

type SqliteCellValue = string | number | bigint | Buffer | null;

function readVarint(buffer: Buffer, offset: number): VarintResult {
  let value = 0n;
  let cursor = offset;

  for (let index = 0; index < 9; index += 1) {
    const byte = buffer[cursor];
    if (byte === undefined) {
      throw new Error("Unexpected end of SQLite varint.");
    }

    cursor += 1;

    if (index === 8) {
      value = (value << 8n) | BigInt(byte);
      break;
    }

    value = (value << 7n) | BigInt(byte & 0x7f);

    if ((byte & 0x80) === 0) {
      break;
    }
  }

  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("SQLite varint exceeds safe JavaScript integer range.");
  }

  return {
    value: Number(value),
    nextOffset: cursor,
  };
}

function readSignedInteger(buffer: Buffer, offset: number, byteLength: number): number {
  if (byteLength === 0) {
    return 0;
  }

  let value = 0n;
  for (let index = 0; index < byteLength; index += 1) {
    const byte = buffer[offset + index];
    if (byte === undefined) {
      throw new Error("Unexpected end of SQLite integer.");
    }
    value = (value << 8n) | BigInt(byte);
  }

  const signBit = 1n << BigInt(byteLength * 8 - 1);
  if ((value & signBit) !== 0n) {
    value -= 1n << BigInt(byteLength * 8);
  }

  return Number(value);
}

function valueLength(serialType: number): number {
  if (serialType === 0 || serialType === 8 || serialType === 9) {
    return 0;
  }
  if (serialType >= 1 && serialType <= 4) {
    return serialType;
  }
  if (serialType === 5) {
    return 6;
  }
  if (serialType === 6 || serialType === 7) {
    return 8;
  }
  if (serialType >= 12) {
    return Math.floor((serialType - 12) / 2);
  }
  throw new Error(`Unsupported SQLite serial type ${serialType}.`);
}

function parseSqliteRecord(buffer: Buffer, offset: number, payloadLength: number): readonly SqliteCellValue[] {
  const payloadEnd = offset + payloadLength;
  const headerLength = readVarint(buffer, offset);
  const headerEnd = offset + headerLength.value;
  let headerOffset = headerLength.nextOffset;
  const serialTypes: number[] = [];

  while (headerOffset < headerEnd) {
    const serialType = readVarint(buffer, headerOffset);
    serialTypes.push(serialType.value);
    headerOffset = serialType.nextOffset;
  }

  let valueOffset = headerEnd;
  const values: SqliteCellValue[] = [];

  for (const serialType of serialTypes) {
    const length = valueLength(serialType);
    if (valueOffset + length > payloadEnd) {
      throw new Error("SQLite record payload ended before all values were read.");
    }

    if (serialType === 0) {
      values.push(null);
    } else if (serialType === 1 || serialType === 2 || serialType === 3 || serialType === 4 || serialType === 5 || serialType === 6) {
      values.push(readSignedInteger(buffer, valueOffset, length));
    } else if (serialType === 7) {
      values.push(buffer.readDoubleBE(valueOffset));
    } else if (serialType === 8) {
      values.push(0);
    } else if (serialType === 9) {
      values.push(1);
    } else if (serialType >= 12 && serialType % 2 === 0) {
      values.push(buffer.subarray(valueOffset, valueOffset + length));
    } else if (serialType >= 13 && serialType % 2 === 1) {
      values.push(buffer.toString("utf8", valueOffset, valueOffset + length));
    } else {
      throw new Error(`Unsupported SQLite serial type ${serialType}.`);
    }

    valueOffset += length;
  }

  return values;
}

function openSqliteDatabase(filePath: string): SqliteDatabase {
  const buffer = readFileSync(filePath);
  const header = buffer.toString("binary", 0, SQLITE_HEADER.length);
  if (header !== SQLITE_HEADER) {
    throw new Error(`Invalid SQLite fixture header at ${filePath}.`);
  }

  const rawPageSize = buffer.readUInt16BE(16);
  const pageSize = rawPageSize === 1 ? 65536 : rawPageSize;
  if (pageSize < 512 || pageSize > 65536) {
    throw new Error(`Unsupported SQLite page size ${pageSize}.`);
  }

  return { buffer, pageSize };
}

function pageOffset(database: SqliteDatabase, pageNumber: number): number {
  if (pageNumber < 1) {
    throw new Error(`Invalid SQLite page number ${pageNumber}.`);
  }
  return (pageNumber - 1) * database.pageSize;
}

function parseTableLeafCell(database: SqliteDatabase, cellOffset: number): readonly SqliteCellValue[] {
  const payloadLength = readVarint(database.buffer, cellOffset);
  const rowId = readVarint(database.buffer, payloadLength.nextOffset);
  return parseSqliteRecord(database.buffer, rowId.nextOffset, payloadLength.value);
}

function parseTablePage(database: SqliteDatabase, pageNumber: number): readonly (readonly SqliteCellValue[])[] {
  const offset = pageOffset(database, pageNumber);
  const headerOffset = pageNumber === 1 ? offset + 100 : offset;
  const pageType = database.buffer[headerOffset];
  if (pageType === undefined) {
    throw new Error(`SQLite page ${pageNumber} is outside the fixture.`);
  }

  const cellCount = database.buffer.readUInt16BE(headerOffset + 3);
  const cellPointerArrayOffset = headerOffset + (pageType === 0x05 ? 12 : 8);
  const rows: (readonly SqliteCellValue[])[] = [];

  if (pageType === 0x0d) {
    for (let index = 0; index < cellCount; index += 1) {
      const cellPointer = database.buffer.readUInt16BE(cellPointerArrayOffset + index * 2);
      rows.push(parseTableLeafCell(database, offset + cellPointer));
    }
    return rows;
  }

  if (pageType === 0x05) {
    for (let index = 0; index < cellCount; index += 1) {
      const cellPointer = database.buffer.readUInt16BE(cellPointerArrayOffset + index * 2);
      const childPage = database.buffer.readUInt32BE(offset + cellPointer);
      rows.push(...parseTablePage(database, childPage));
    }
    const rightMostPage = database.buffer.readUInt32BE(headerOffset + 8);
    rows.push(...parseTablePage(database, rightMostPage));
    return rows;
  }

  throw new Error(`Unsupported SQLite table page type 0x${pageType.toString(16)}.`);
}

function asString(value: SqliteCellValue, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`SQLite field ${fieldName} must be a string.`);
  }
  return value;
}

function asNumber(value: SqliteCellValue, fieldName: string): number {
  if (typeof value !== "number") {
    throw new Error(`SQLite field ${fieldName} must be a number.`);
  }
  return value;
}

function asOptionalString(value: SqliteCellValue, fieldName: string): string | null {
  if (value === null) {
    return null;
  }
  return asString(value, fieldName);
}

function parseSqliteMaster(database: SqliteDatabase): readonly SqliteMasterRow[] {
  return parseTablePage(database, 1).map((values) => ({
    type: asString(values[0] ?? null, "sqlite_master.type"),
    name: asString(values[1] ?? null, "sqlite_master.name"),
    tableName: asString(values[2] ?? null, "sqlite_master.tbl_name"),
    rootPage: asNumber(values[3] ?? null, "sqlite_master.rootpage"),
    sql: asOptionalString(values[4] ?? null, "sqlite_master.sql"),
  }));
}

function parseColumnNames(createSql: string): readonly string[] {
  const openIndex = createSql.indexOf("(");
  const closeIndex = createSql.lastIndexOf(")");
  if (openIndex < 0 || closeIndex <= openIndex) {
    throw new Error("SQLite table DDL does not contain a column list.");
  }

  return createSql
    .slice(openIndex + 1, closeIndex)
    .split(",")
    .map((column) => column.trim().split(/\s+/u)[0] ?? "")
    .map((column) => column.replace(/^"|"$/gu, ""))
    .filter((column) => column.length > 0);
}

function matchesTeam(record: CoachMatchHistoryRecord, teamId: string | undefined): boolean {
  return teamId === undefined || record.homeTeamId === teamId || record.awayTeamId === teamId;
}

function countCompatible(records: readonly CoachMatchHistoryRecord[]): number {
  return records.filter(coachMatchHistoryRecordMatchesDurableSchema).length;
}

function parseScore(scoreJson: string): {
  readonly scoreHome: number;
  readonly scoreAway: number;
  readonly scoreSource: CoachMatchHistoryRecord["scoreSource"];
} {
  const parsed = JSON.parse(scoreJson) as unknown;
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { readonly home?: unknown }).home !== "number" ||
    typeof (parsed as { readonly away?: unknown }).away !== "number"
  ) {
    throw new Error("SQLite score payload is malformed.");
  }
  const source = (parsed as { readonly source?: unknown }).source;
  if (source !== "official_report_score" && source !== "live_scoring_events_sample" && source !== "unknown") {
    throw new Error("SQLite score source is malformed.");
  }

  return {
    scoreHome: (parsed as { readonly home: number }).home,
    scoreAway: (parsed as { readonly away: number }).away,
    scoreSource: source,
  };
}

function recordFromRow(row: ReadonlyMap<string, SqliteCellValue>): CoachMatchHistoryRecord {
  const score = parseScore(asString(row.get("score") ?? null, "score"));
  const record = {
    historyRecordId: asString(row.get("recordId") ?? null, "recordId"),
    matchId: asString(row.get("matchId") ?? null, "matchId"),
    runId: asString(row.get("runId") ?? null, "runId"),
    generatedAtIso: asString(row.get("generatedAt") ?? null, "generatedAt"),
    homeTeamId: asString(row.get("teamId") ?? null, "teamId"),
    awayTeamId: asString(row.get("opponentTeamId") ?? null, "opponentTeamId"),
    homeTeamName: asString(row.get("homeTeamName") ?? null, "homeTeamName"),
    awayTeamName: asString(row.get("awayTeamName") ?? null, "awayTeamName"),
    scoreHome: score.scoreHome,
    scoreAway: score.scoreAway,
    scoreSource: score.scoreSource,
    source: asString(row.get("source") ?? null, "source"),
    reportVersion: asString(row.get("reportVersion") ?? null, "reportVersion"),
    signals: JSON.parse(asString(row.get("phaseSignals") ?? null, "phaseSignals")) as unknown,
    officialTimelineSourcePreserved: true,
    officialScorePreserved: true,
    officialPossessionPreserved: true,
    officialScoringEventsPreserved: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
  };

  const [parsed] = parseCoachMatchHistoryRecords(JSON.stringify([record]));
  if (parsed === undefined) {
    throw new Error(`SQLite row ${record.historyRecordId} did not produce a valid history record.`);
  }
  return parsed;
}

function loadRecordsFromFixture(filePath: string): {
  readonly records: readonly CoachMatchHistoryRecord[];
  readonly columns: readonly string[];
} {
  const database = openSqliteDatabase(filePath);
  const masterRows = parseSqliteMaster(database);
  const table = masterRows.find((row) => row.type === "table" && row.name === HISTORY_TABLE_NAME);
  if (table === undefined) {
    throw new Error(`SQLite fixture does not contain ${HISTORY_TABLE_NAME}.`);
  }
  if (table.sql === null) {
    throw new Error(`SQLite table ${HISTORY_TABLE_NAME} does not expose a DDL statement.`);
  }

  const columns = parseColumnNames(table.sql);
  const tableRows = parseTablePage(database, table.rootPage);
  const records = tableRows.map((values) => {
    const row = new Map<string, SqliteCellValue>();
    columns.forEach((column, index) => {
      row.set(column, values[index] ?? null);
    });
    const schemaVersion = asString(row.get("schemaVersion") ?? null, "schemaVersion");
    if (schemaVersion !== COACH_MATCH_HISTORY_SCHEMA_VERSION) {
      throw new Error(`SQLite row has unsupported schema version ${schemaVersion}.`);
    }
    return recordFromRow(row);
  });

  return {
    columns,
    records: sortCoachMatchHistoryRecords(records),
  };
}

function description(input: {
  readonly fixturePath: string;
  readonly records: readonly CoachMatchHistoryRecord[];
  readonly columns: readonly string[];
  readonly controlledRealDatabaseReadCount: number;
  readonly writeRejectedCount: number;
}): SqliteRealReadOnlyCoachMatchHistoryAdapterDescription {
  const schemaCompatibleRecordCount = countCompatible(input.records);
  const missingRequiredColumnCount = REQUIRED_COLUMNS.filter((column) => !input.columns.includes(column)).length;

  return {
    adapterKind: "sqlite_local_readonly_real_smoke_test",
    status: "implemented",
    modeName: "real_sqlite_readonly_io_smoke_test",
    schemaVersion: COACH_MATCH_HISTORY_SCHEMA_VERSION,
    durable: true,
    readOnlyForReports: true,
    supportsQueryByTeam: true,
    supportsQueryByPhase: true,
    supportsQueryBySeason: false,
    supportsQueryByCompetition: false,
    implemented: true,
    productionReady: false,
    featureFlagEnabled: false,
    defaultFeatureFlagEnabled: false,
    productActivationAllowed: false,
    reportCanUseAsSourceOfTruth: false,
    databaseUsedAsProductTruth: false,
    defaultRealDatabaseReadCount: 0,
    controlledRealDatabaseReadCount: input.controlledRealDatabaseReadCount,
    realDatabaseWriteCount: 0,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    readOnlyMode: true,
    writeModeAllowed: false,
    writeRejectedCount: input.writeRejectedCount,
    fixturePath: input.fixturePath,
    fixtureRecordCount: input.records.length,
    schemaCompatibleRecordCount,
    schemaIncompatibleRecordCount: input.records.length - schemaCompatibleRecordCount,
    sqliteHeaderValid: true,
    tableName: HISTORY_TABLE_NAME,
    requiredColumnCount: REQUIRED_COLUMNS.length,
    missingRequiredColumnCount,
    trueSqliteIoUsed: true,
  };
}

export function createSqliteRealReadOnlyCoachMatchHistoryAdapter(input: {
  readonly fixturePath: string;
  readonly explicitControlledMode: true;
}): SqliteRealReadOnlyCoachMatchHistoryAdapter {
  const loaded = loadRecordsFromFixture(input.fixturePath);
  let controlledRealDatabaseReadCount = 1;
  let writeRejectedCount = 0;

  return {
    adapterKind: "sqlite_local_readonly_real_smoke_test",
    describe(): SqliteRealReadOnlyCoachMatchHistoryAdapterDescription {
      return description({
        fixturePath: input.fixturePath,
        records: loaded.records,
        columns: loaded.columns,
        controlledRealDatabaseReadCount,
        writeRejectedCount,
      });
    },
    readOnlyQuery(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult {
      controlledRealDatabaseReadCount += 1;
      const filtered = loaded.records
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
          "real_sqlite_readonly_io_smoke_test reads a non-prod SQLite fixture in explicit controlled mode only.",
          "SQLite local remains non-product truth; file_backed remains the active product history source.",
        ],
      };
    },
    rejectWrite(record: CoachMatchHistoryRecord): CoachMatchHistorySaveResult {
      writeRejectedCount += 1;

      return {
        operation: "rejected_write",
        record: cloneCoachMatchHistoryRecord(record),
        recordsBeforeSaveCount: loaded.records.length,
        recordsAfterSaveCount: loaded.records.length,
        loadedFromDiskCount: loaded.records.length,
        writtenToDiskCount: 0,
        dedupedRecordCount: 0,
        replacedRecordCount: 0,
        ignoredDuplicateCount: 0,
        idempotent: false,
        warnings: [
          "Write rejected: real_sqlite_readonly_io_smoke_test exposes no SQLite write path.",
        ],
      };
    },
    listReadOnlyRecords(): readonly CoachMatchHistoryRecord[] {
      return loaded.records.map(cloneCoachMatchHistoryRecord);
    },
  };
}
