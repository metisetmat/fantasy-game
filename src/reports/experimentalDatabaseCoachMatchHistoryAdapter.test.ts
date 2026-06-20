import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { createExperimentalDatabaseCoachMatchHistoryAdapter } from "./history/experimentalDatabaseCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateExperimentalDatabaseCoachMatchHistoryAdapter(): readonly string[] {
  const { currentRecord: record } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const adapter = createExperimentalDatabaseCoachMatchHistoryAdapter();
  const description = adapter.describe();
  const inserted = adapter.dryRunSave(record);
  const replaced = adapter.dryRunSave({ ...record, reportVersion: `${record.reportVersion}-replacement` });
  const ignoredDuplicate = adapter.dryRunSave({ ...record, reportVersion: `${record.reportVersion}-replacement` });
  const teamQuery = adapter.dryRunQuery({
    teamId: record.homeTeamId,
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const phase = record.signals[0]?.phase;
  const phaseQuery = adapter.dryRunQuery({
    ...(phase === undefined ? {} : { phase }),
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });

  assertTest(adapter.adapterKind === "experimental_database", "adapter kind is experimental_database.");
  assertTest(description.status === "implemented", "experimental adapter is implemented.");
  assertTest(!description.productionReady, "experimental adapter is not production ready.");
  assertTest(description.realDatabaseReadCount === 0 && description.realDatabaseWriteCount === 0, "no real database IO.");
  assertTest(inserted.operation === "inserted", "first save inserts.");
  assertTest(replaced.operation === "replaced", "changed save replaces.");
  assertTest(ignoredDuplicate.operation === "ignored_duplicate", "same changed save is ignored duplicate.");
  assertTest(teamQuery.records.some((candidate) => candidate.historyRecordId === record.historyRecordId), "query by team returns record.");
  assertTest(phase === undefined || phaseQuery.records.some((candidate) => candidate.signals.some((signal) => signal.phase === phase)), "query by phase returns matching signal.");

  return [
    "experimental adapter implemented but not production ready",
    "dry-run save preserves inserted, replaced, ignored_duplicate",
    "dry-run query supports team and phase",
    "real database IO counts remain 0",
  ];
}

if (require.main === module) {
  const checks = validateExperimentalDatabaseCoachMatchHistoryAdapter();
  console.log("experimentalDatabaseCoachMatchHistoryAdapter tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
