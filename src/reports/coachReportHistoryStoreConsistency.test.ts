import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistency(): readonly string[] {
  const { historyStoreConsistency } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyStoreConsistency.status === "available" || historyStoreConsistency.status === "partial", "history store consistency is available or partial.");
  assertTest(historyStoreConsistency.saveOperation !== "not_available", "save operation is visible.");
  assertTest(historyStoreConsistency.databaseContractVisible, "database contract is visible.");
  assertTest(!historyStoreConsistency.databaseContractImplemented, "database contract is not implemented.");
  assertTest(historyStoreConsistency.databaseMigrationRequired, "database migration requirement is visible.");
  assertTest(historyStoreConsistency.tags.includes("coach_report_history_store_consistency"), "consistency tags are present.");

  return [
    "history store consistency is available or partial",
    "save operation is visible",
    "database contract is visible",
    "database contract is not implemented",
    "database migration requirement is visible",
    "consistency tags are present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistency();
  console.log("coachReportHistoryStoreConsistency tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
