import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { createSqliteLocalCoachMatchHistoryAdapter } from "./history/sqliteLocalCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSqliteLocalCoachMatchHistoryAdapter(): readonly string[] {
  const { currentRecord } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const adapter = createSqliteLocalCoachMatchHistoryAdapter();
  const description = adapter.describe();
  const inserted = adapter.dryRunSave(currentRecord);
  const replacement = adapter.dryRunSave({ ...currentRecord, reportVersion: `${currentRecord.reportVersion}-sqlite-test` });
  const duplicate = adapter.dryRunSave({ ...currentRecord, reportVersion: `${currentRecord.reportVersion}-sqlite-test` });
  const teamQuery = adapter.dryRunQuery({
    teamId: currentRecord.homeTeamId,
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const phase = currentRecord.signals[0]?.phase;
  const phaseQuery = adapter.dryRunQuery({
    ...(phase === undefined ? {} : { phase }),
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });

  assertTest(description.adapterKind === "sqlite_local_disabled", "adapter kind is sqlite_local_disabled.");
  assertTest(description.implemented, "adapter wiring is implemented.");
  assertTest(!description.productionReady, "adapter is not production ready.");
  assertTest(!description.productActivationAllowed, "product activation is not allowed.");
  assertTest(description.realDatabaseReadCount === 0 && description.realDatabaseWriteCount === 0, "real database IO is 0.");
  assertTest(inserted.operation === "inserted", "inserted scenario passes.");
  assertTest(replacement.operation === "replaced", "replaced scenario passes.");
  assertTest(duplicate.operation === "ignored_duplicate", "ignored duplicate scenario passes.");
  assertTest(teamQuery.records.length > 0, "query by team passes.");
  assertTest(phase === undefined || phaseQuery.records.some((record) => record.signals.some((signal) => signal.phase === phase)), "query by phase passes.");

  return [
    "sqlite local disabled adapter is implemented but not production ready",
    "real database IO remains 0",
    "inserted, replaced, ignored_duplicate pass",
    "query by team and phase pass",
  ];
}

if (require.main === module) {
  const checks = validateSqliteLocalCoachMatchHistoryAdapter();
  console.log("sqliteLocalCoachMatchHistoryAdapter tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
