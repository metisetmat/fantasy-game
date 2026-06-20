import type {
  CoachMatchHistoryRecord,
  CoachMatchHistorySignal,
  CoachMatchHistorySignalPhase,
  CoachMatchHistorySignalStability,
  CoachMatchHistorySource,
} from "./coachMatchHistory";

const validSignalPhases: readonly CoachMatchHistorySignalPhase[] = [
  "with_ball",
  "without_ball",
  "goalkeeper",
];

const validSignalStabilities: readonly CoachMatchHistorySignalStability[] = [
  "local_repeated",
  "local_visible_once",
  "local_unstable",
  "insufficient_data",
  "not_evaluated",
];

const validHistorySources: readonly CoachMatchHistorySource[] = [
  "current_product_report",
  "controlled_sample",
  "simulated_match_history",
  "product_history_store",
];

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function cloneSignal(signal: CoachMatchHistorySignal): CoachMatchHistorySignal {
  return { ...signal };
}

export function cloneCoachMatchHistoryRecord(
  record: CoachMatchHistoryRecord,
): CoachMatchHistoryRecord {
  return {
    ...record,
    signals: record.signals.map(cloneSignal),
  };
}

function compareRecords(
  left: CoachMatchHistoryRecord,
  right: CoachMatchHistoryRecord,
): number {
  return left.generatedAtIso.localeCompare(right.generatedAtIso) ||
    left.matchId.localeCompare(right.matchId) ||
    left.historyRecordId.localeCompare(right.historyRecordId);
}

export function sortCoachMatchHistoryRecords(
  records: readonly CoachMatchHistoryRecord[],
): readonly CoachMatchHistoryRecord[] {
  return records
    .map(cloneCoachMatchHistoryRecord)
    .sort(compareRecords);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSignal(value: unknown): value is CoachMatchHistorySignal {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.signalId === "string" &&
    isOneOf(value.phase, validSignalPhases) &&
    typeof value.label === "string" &&
    isOneOf(value.stability, validSignalStabilities) &&
    isOneOf(value.source, validHistorySources) &&
    typeof value.explanation === "string" &&
    (value.zone === undefined || typeof value.zone === "string") &&
    (value.value === undefined || typeof value.value === "number");
}

function isRecord(value: unknown): value is CoachMatchHistoryRecord {
  if (!isObject(value) || !Array.isArray(value.signals)) {
    return false;
  }

  return typeof value.historyRecordId === "string" &&
    typeof value.matchId === "string" &&
    typeof value.runId === "string" &&
    typeof value.generatedAtIso === "string" &&
    typeof value.homeTeamId === "string" &&
    typeof value.awayTeamId === "string" &&
    typeof value.homeTeamName === "string" &&
    typeof value.awayTeamName === "string" &&
    typeof value.scoreHome === "number" &&
    typeof value.scoreAway === "number" &&
    (value.scoreSource === "official_report_score" || value.scoreSource === "live_scoring_events_sample" || value.scoreSource === "unknown") &&
    isOneOf(value.source, validHistorySources) &&
    typeof value.reportVersion === "string" &&
    value.signals.every(isSignal) &&
    value.officialTimelineSourcePreserved === true &&
    value.officialScorePreserved === true &&
    value.officialPossessionPreserved === true &&
    value.officialScoringEventsPreserved === true &&
    value.canChangeLineup === false &&
    value.canChangeStarters === false &&
    value.canChangeBench === false &&
    value.canDriveCoachInstruction === false &&
    value.canDriveLiveSelection === false &&
    value.canDriveProductionRouteResolution === false &&
    value.canMutateTimeline === false &&
    value.canMutateScore === false &&
    value.canMutatePossession === false &&
    value.canCreateScoringEvent === false &&
    value.canClaimGlobalEconomy === false;
}

export function serializeCoachMatchHistoryRecords(
  records: readonly CoachMatchHistoryRecord[],
): string {
  return `${JSON.stringify(sortCoachMatchHistoryRecords(records), null, 2)}\n`;
}

export function coachMatchHistoryRecordsHaveSameContent(
  left: CoachMatchHistoryRecord,
  right: CoachMatchHistoryRecord,
): boolean {
  return serializeCoachMatchHistoryRecords([left]) === serializeCoachMatchHistoryRecords([right]);
}

export function parseCoachMatchHistoryRecords(
  json: string,
): readonly CoachMatchHistoryRecord[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch (error) {
    throw new Error(`Invalid coach match history JSON: ${error instanceof Error ? error.message : "parse error"}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid coach match history JSON: expected an array of records.");
  }

  if (!parsed.every(isRecord)) {
    throw new Error("Invalid coach match history JSON: one or more records are malformed.");
  }

  return sortCoachMatchHistoryRecords(parsed);
}
