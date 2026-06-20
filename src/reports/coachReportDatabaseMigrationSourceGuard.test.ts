import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseMigrationSourceGuard(): readonly string[] {
  const { databaseMigrationPreparation } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseMigrationPreparation.sourceStoreKind === "file_backed", "migration consumes file-backed records.");
  assertTest(databaseMigrationPreparation.targetAdapterKind === "mock_database", "migration consumes database SPI mock only.");
  assertTest(databaseMigrationPreparation.singleSourceOfTruth, "migration does not create a second source of truth.");
  assertTest(databaseMigrationPreparation.realDatabaseWriteCount === 0, "migration does not write to real DB.");
  assertTest(databaseMigrationPreparation.realDatabaseReadCount === 0, "migration does not read from real DB.");
  assertTest(databaseMigrationPreparation.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events are not promoted to official.");
  assertTest(databaseMigrationPreparation.inventedStatisticCount === 0, "invented statistic count is 0.");
  assertTest(databaseMigrationPreparation.scoreMutationCount === 0, "product/export score matches.");
  assertTest(databaseMigrationPreparation.visibleSelectionWordingCount === 0, "candidate comparison remains non-selection.");

  return [
    "migration consumes file-backed records and database SPI only",
    "migration does not create a second source of truth",
    "migration does not write to or read from real DB",
    "sandbox-only events are not promoted",
    "invented statistic count is 0",
    "product/export score and candidate comparison guardrails remain intact",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationSourceGuard();
  console.log("coachReportDatabaseMigrationSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
