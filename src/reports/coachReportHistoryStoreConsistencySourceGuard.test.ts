import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencySourceGuard(): readonly string[] {
  const { historyStoreConsistency, persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(persistentHistoryAdapter.saveResult !== undefined, "persistent adapter exposes save result.");
  assertTest(historyStoreConsistency.recordsBeforeSaveCount === persistentHistoryAdapter.saveResult.recordsBeforeSaveCount, "before count comes from save result.");
  assertTest(historyStoreConsistency.recordsAfterSaveCount === persistentHistoryAdapter.saveResult.recordsAfterSaveCount, "after count comes from save result.");
  assertTest(historyStoreConsistency.loadedFromDiskCount === persistentHistoryAdapter.saveResult.loadedFromDiskCount, "loaded count comes from save result.");
  assertTest(historyStoreConsistency.writtenToDiskCount === persistentHistoryAdapter.saveResult.writtenToDiskCount, "written count comes from save result.");

  return [
    "persistent adapter exposes save result",
    "before count comes from save result",
    "after count comes from save result",
    "loaded count comes from save result",
    "written count comes from save result",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencySourceGuard();
  console.log("coachReportHistoryStoreConsistencySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
