import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryQueryResult,
  CoachMatchHistoryRecord,
} from "./coachMatchHistory";

export interface CoachMatchHistoryStore {
  readonly storeKind: "in_memory" | "file_backed" | "future_database";

  save(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord;

  query(query: CoachMatchHistoryQuery): CoachMatchHistoryQueryResult;

  listAll(): readonly CoachMatchHistoryRecord[];
}

