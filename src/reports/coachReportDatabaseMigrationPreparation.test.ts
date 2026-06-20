import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseMigrationPreparation(): readonly string[] {
  const { databaseMigrationPreparation } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseMigrationPreparation.status === "available" || databaseMigrationPreparation.status === "partial", "report model exists.");
  assertTest(databaseMigrationPreparation.sourceStoreKind === "file_backed", "source store kind is file_backed.");
  assertTest(databaseMigrationPreparation.targetAdapterKind === "mock_database" || databaseMigrationPreparation.targetAdapterKind === "future_database", "target adapter kind is visible.");
  assertTest(databaseMigrationPreparation.dryRunOnly, "dry run only true.");
  assertTest(!databaseMigrationPreparation.databaseAdapterImplemented, "database adapter implemented false.");
  assertTest(!databaseMigrationPreparation.databaseAdapterProductionReady, "database adapter production ready false.");
  assertTest(databaseMigrationPreparation.realDatabaseWriteCount === 0, "real DB write count 0.");
  assertTest(databaseMigrationPreparation.realDatabaseReadCount === 0, "real DB read count 0.");
  assertTest(databaseMigrationPreparation.trendProofClaimCount === 0, "trend proof claim count 0.");
  assertTest(databaseMigrationPreparation.globalProofClaimCount === 0, "global proof claim count 0.");
  assertTest(databaseMigrationPreparation.inventedStatisticCount === 0, "invented statistic count 0.");
  assertTest(databaseMigrationPreparation.sandboxEventsPromotedToOfficialCount === 0, "sandbox promoted to official count 0.");

  return [
    "report model exists",
    "source store kind is file_backed",
    "target adapter kind is visible",
    "dry run only true",
    "database adapter implemented and production ready false",
    "real DB read and write counts are 0",
    "proof and invented-statistic counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationPreparation();
  console.log("coachReportDatabaseMigrationPreparation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
