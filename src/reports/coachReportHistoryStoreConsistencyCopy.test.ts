import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyCopy(): readonly string[] {
  const { exportHtml, historyStoreConsistency } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyStoreConsistency.status === "available" || historyStoreConsistency.status === "partial", "evidence names storage consistency.");
  assertTest(!historyStoreConsistency.canMutateScore, "evidence says score cannot mutate.");
  assertTest(!historyStoreConsistency.databaseContractImplemented, "evidence marks database adapter unimplemented.");
  assertTest(!exportHtml.includes("officially_confirmed"), "visible copy does not promote official confirmation.");

  return [
    "export evidence names storage consistency",
    "export evidence says score cannot mutate",
    "export evidence marks database adapter unimplemented",
    "visible copy does not promote official confirmation",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyCopy();
  console.log("coachReportHistoryStoreConsistencyCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
