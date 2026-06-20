import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpike(): readonly string[] {
  const { databaseAdapterSpike } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseAdapterSpike.status === "available", "database adapter spike model is available.");
  assertTest(databaseAdapterSpike.adapterKind === "experimental_database", "adapter kind is experimental_database.");
  assertTest(databaseAdapterSpike.adapterImplemented, "adapter implemented is true.");
  assertTest(!databaseAdapterSpike.adapterProductionReady, "adapter production ready is false.");
  assertTest(databaseAdapterSpike.dryRunOnly, "spike is dry-run only.");
  assertTest(databaseAdapterSpike.realDatabaseReadCount === 0 && databaseAdapterSpike.realDatabaseWriteCount === 0, "no real database IO.");
  assertTest(databaseAdapterSpike.insertedScenarioPass, "inserted scenario passes.");
  assertTest(databaseAdapterSpike.replacedScenarioPass, "replaced scenario passes.");
  assertTest(databaseAdapterSpike.ignoredDuplicateScenarioPass, "ignored duplicate scenario passes.");
  assertTest(databaseAdapterSpike.queryByTeamPass, "query by team passes.");
  assertTest(databaseAdapterSpike.queryByPhasePass, "query by phase passes.");
  assertTest(databaseAdapterSpike.deterministicOrderingPass, "deterministic ordering passes.");

  return [
    "database adapter spike available",
    "experimental adapter implemented but not production ready",
    "dry-run save/query scenarios pass",
    "real database IO counts remain 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpike();
  console.log("coachReportDatabaseAdapterSpike tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
