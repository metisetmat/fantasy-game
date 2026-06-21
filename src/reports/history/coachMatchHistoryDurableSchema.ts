import type { CoachMatchHistoryRecord } from "./coachMatchHistory";

export type CoachMatchHistoryDurableStorageTarget =
  | "sqlite_local"
  | "postgres"
  | "supabase"
  | "file_backed_only"
  | "undecided";

export const COACH_MATCH_HISTORY_SCHEMA_VERSION = "coach_match_history_v1";

export interface CoachMatchHistoryDurableSchemaField {
  readonly name: string;
  readonly source: string;
  readonly required: boolean;
}

export interface CoachMatchHistoryDurableSchemaContract {
  readonly schemaVersion: typeof COACH_MATCH_HISTORY_SCHEMA_VERSION;
  readonly selectedStorageTarget: CoachMatchHistoryDurableStorageTarget;
  readonly fields: readonly CoachMatchHistoryDurableSchemaField[];
  readonly idempotencyKeyDescription: string;
  readonly canModifyMatchReportContract: false;
  readonly canModifyMatchBonusEvent: false;
  readonly canModifyScoringConstants: false;
  readonly canCreateScoringEvents: false;
}

export const coachMatchHistoryDurableSchemaContract: CoachMatchHistoryDurableSchemaContract = {
  schemaVersion: COACH_MATCH_HISTORY_SCHEMA_VERSION,
  selectedStorageTarget: "sqlite_local",
  fields: [
    { name: "recordId", source: "CoachMatchHistoryRecord.historyRecordId", required: true },
    { name: "matchId", source: "CoachMatchHistoryRecord.matchId", required: true },
    { name: "teamId", source: "CoachMatchHistoryRecord.homeTeamId", required: true },
    { name: "opponentTeamId", source: "CoachMatchHistoryRecord.awayTeamId", required: true },
    { name: "generatedAt", source: "CoachMatchHistoryRecord.generatedAtIso", required: true },
    { name: "source", source: "CoachMatchHistoryRecord.source", required: true },
    { name: "score", source: "CoachMatchHistoryRecord.scoreHome/scoreAway/scoreSource", required: true },
    { name: "phaseSignals", source: "CoachMatchHistoryRecord.signals", required: true },
    { name: "evidenceSnapshotId", source: "CoachReportPersistenceEvidenceSnapshot.snapshotId", required: false },
    { name: "createdAt", source: "adapter write timestamp in future real IO mode", required: true },
    { name: "updatedAt", source: "adapter update timestamp in future real IO mode", required: true },
    { name: "idempotencyKey", source: "historyRecordId", required: true },
  ],
  idempotencyKeyDescription: "historyRecordId is the logical idempotency key for inserted/replaced/ignored_duplicate semantics.",
  canModifyMatchReportContract: false,
  canModifyMatchBonusEvent: false,
  canModifyScoringConstants: false,
  canCreateScoringEvents: false,
};

export function coachMatchHistoryRecordMatchesDurableSchema(record: CoachMatchHistoryRecord): boolean {
  return record.historyRecordId.length > 0 &&
    record.matchId.length > 0 &&
    record.homeTeamId.length > 0 &&
    record.awayTeamId.length > 0 &&
    record.generatedAtIso.length > 0 &&
    record.signals.length > 0 &&
    record.officialTimelineSourcePreserved &&
    record.officialScorePreserved &&
    record.officialPossessionPreserved &&
    record.officialScoringEventsPreserved &&
    !record.canCreateScoringEvent &&
    !record.canClaimGlobalEconomy;
}
