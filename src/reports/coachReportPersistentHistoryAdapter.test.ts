import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPersistentHistoryAdapter(): readonly string[] {
  const { persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(persistentHistoryAdapter.status === "available" || persistentHistoryAdapter.status === "partial", "persistent adapter status is available or partial.");
  assertTest(persistentHistoryAdapter.storeKind.length > 0, "store kind is present.");
  assertTest(typeof persistentHistoryAdapter.durable === "boolean", "durable flag is present.");
  assertTest(persistentHistoryAdapter.currentMatchRecordSaved, "current match record saved true.");
  assertTest(persistentHistoryAdapter.recordsBeforeSaveCount >= 0, "records before save count is present.");
  assertTest(persistentHistoryAdapter.recordsAfterSaveCount >= persistentHistoryAdapter.recordsBeforeSaveCount, "records after save count is present.");
  assertTest(persistentHistoryAdapter.queriedRecordCount >= 1, "queried record count is present.");
  assertTest(persistentHistoryAdapter.queriedSignalCount >= 1, "queried signal count is present.");
  assertTest(persistentHistoryAdapter.reportQueriesReadOnly, "report queries read-only true.");
  assertTest(persistentHistoryAdapter.trendProofClaimCount === 0, "trend proof claim count is 0.");
  assertTest(persistentHistoryAdapter.globalProofClaimCount === 0, "global proof claim count is 0.");
  assertTest(persistentHistoryAdapter.inventedStatisticCount === 0, "invented statistic count is 0.");
  assertTest(persistentHistoryAdapter.sandboxEventsPromotedToOfficialCount === 0, "sandbox events promoted to official count is 0.");

  return [
    "persistent adapter model exists",
    "status is available or partial",
    "store kind is present",
    "durable flag is present",
    "current match record saved true",
    "records before and after save counts are present",
    "queried record and signal counts are present",
    "report queries read-only true",
    "trend proof claim count is 0",
    "global proof claim count is 0",
    "invented statistic count is 0",
    "sandbox events promoted to official count is 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPersistentHistoryAdapter();
  console.log("coachReportPersistentHistoryAdapter tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
