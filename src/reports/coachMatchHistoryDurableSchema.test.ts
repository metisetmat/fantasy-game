import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import {
  coachMatchHistoryDurableSchemaContract,
  coachMatchHistoryRecordMatchesDurableSchema,
} from "./history/coachMatchHistoryDurableSchema";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachMatchHistoryDurableSchema(): readonly string[] {
  const { currentRecord } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachMatchHistoryDurableSchemaContract.schemaVersion === "coach_match_history_v1", "schema version is coach_match_history_v1.");
  assertTest(coachMatchHistoryDurableSchemaContract.selectedStorageTarget === "sqlite_local", "storage target is sqlite_local.");
  assertTest(coachMatchHistoryDurableSchemaContract.fields.some((field) => field.name === "idempotencyKey"), "idempotency key exists.");
  assertTest(coachMatchHistoryDurableSchemaContract.fields.some((field) => field.name === "phaseSignals"), "phase signals field exists.");
  assertTest(!coachMatchHistoryDurableSchemaContract.canModifyMatchReportContract, "schema cannot modify MatchReport contract.");
  assertTest(!coachMatchHistoryDurableSchemaContract.canModifyMatchBonusEvent, "schema cannot modify MatchBonusEvent.");
  assertTest(!coachMatchHistoryDurableSchemaContract.canModifyScoringConstants, "schema cannot modify scoring constants.");
  assertTest(!coachMatchHistoryDurableSchemaContract.canCreateScoringEvents, "schema cannot create scoring events.");
  assertTest(coachMatchHistoryRecordMatchesDurableSchema(currentRecord), "current record matches durable schema.");

  return [
    "schema version coach_match_history_v1",
    "target sqlite_local",
    "idempotency and phase-signal fields exist",
    "schema cannot modify MatchReport, MatchBonusEvent, scoring constants, or scoring events",
  ];
}

if (require.main === module) {
  const checks = validateCoachMatchHistoryDurableSchema();
  console.log("coachMatchHistoryDurableSchema tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
