import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyRenderer(): readonly string[] {
  const { historyStoreConsistency } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyStoreConsistency.status === "available" || historyStoreConsistency.status === "partial", "export evidence renders history-store consistency model.");
  assertTest(historyStoreConsistency.consistencyBoundaryVisible, "export evidence renders consistency boundary.");
  assertTest(historyStoreConsistency.databaseContractVisible, "export evidence renders migration SPI contract note.");
  assertTest(!historyStoreConsistency.databaseContractImplemented, "export evidence clarifies legacy adapter is not implemented.");
  assertTest(historyStoreConsistency.tags.includes("coach_report_history_store_consistency"), "export retains consistency evidence.");

  return [
    "export evidence renders history-store consistency model",
    "export evidence renders consistency boundary",
    "export evidence renders migration SPI contract note",
    "7F can move the visible history consistency section out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyRenderer();
  console.log("coachReportHistoryStoreConsistencyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
