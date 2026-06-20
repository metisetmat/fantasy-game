import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpikeSourceGuard(): readonly string[] {
  const { databaseAdapterSpike, databaseMigrationPreparation, persistenceEvidenceSnapshot } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseAdapterSpike.sourceRecordCount > 0, "spike consumes persisted source records.");
  assertTest(databaseAdapterSpike.warnings.some((warning) => warning.includes(persistenceEvidenceSnapshot.snapshotId)), "spike warning references persistence snapshot.");
  assertTest(databaseAdapterSpike.warnings.some((warning) => warning.includes("file_backed")), "spike warning preserves file_backed source boundary.");
  assertTest(databaseAdapterSpike.sourceRecordCount === databaseMigrationPreparation.sourceRecordCount, "spike and migration preparation use the same source record count.");

  return [
    "spike consumes source records",
    "spike references persistence evidence snapshot",
    "spike preserves file_backed source boundary",
    "spike aligns source record count with migration preparation",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpikeSourceGuard();
  console.log("coachReportDatabaseAdapterSpikeSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
