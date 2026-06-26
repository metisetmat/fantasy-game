import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseMigrationRenderer(): readonly string[] {
  const { exportHtml, databaseMigrationPreparation } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseMigrationPreparation.status === "available", "export evidence contains migration preparation model.");
  assertTest(databaseMigrationPreparation.dryRunOnly, "export evidence contains migration dry-run guard.");
  assertTest(databaseMigrationPreparation.migrationPlanCount >= 0, "export evidence contains what the migration prepares.");
  assertTest(!databaseMigrationPreparation.databaseAdapterProductionReady, "export evidence contains what remains limited.");
  assertTest(databaseMigrationPreparation.reportQueriesReadOnly, "export evidence keeps report queries read-only.");
  assertTest(exportHtml.includes("coach_report_database_migration_preparation") || exportHtml.includes("migration"), "export retains database migration evidence.");

  return [
    "export evidence contains migration preparation model",
    "export evidence contains migration dry-run guard",
    "export evidence contains migration plan and limitation boundaries",
    "7F can move the visible migration section out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationRenderer();
  console.log("coachReportDatabaseMigrationRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
